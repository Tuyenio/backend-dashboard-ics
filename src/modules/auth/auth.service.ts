import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  /**
   * Xác thực user bằng email và password
   */
  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      if (!user) {
        return null;
      }

      // Kiểm tra nếu user đăng nhập bằng Google
      if (!user.password && user.googleId) {
        throw new BadRequestException(
          'Tài khoản này đăng nhập bằng Google. Vui lòng sử dụng đăng nhập Google.',
        );
      }

      if (!user.password) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }

      // Loại bỏ password khỏi object trả về
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi xác thực user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Đăng nhập và tạo JWT token
   */
  async login(user: any) {
    try {
      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
      };

      // Cập nhật last login
      await this.usersService.updateLastLogin(user.id);

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role,
          status: user.status,
        },
      };
    } catch (error) {
      this.logger.error(`Lỗi khi đăng nhập: ${error.message}`);
      throw error;
    }
  }

  /**
   * Đăng ký user mới
   */
  async register(registerDto: RegisterDto) {
    try {
      // Tạo user mới
      const user = await this.usersService.create(registerDto);

      // Gửi email chào mừng
      try {
        await this.mailService.sendWelcomeEmail(user.email, user.fullName);
        this.logger.log(`Email chào mừng đã được gửi đến ${user.email}`);
      } catch (emailError) {
        this.logger.error(
          `Không thể gửi email chào mừng: ${emailError.message}`,
        );
        // Không throw error, chỉ log
      }

      // Tự động đăng nhập sau khi đăng ký
      return this.login(user);
    } catch (error) {
      this.logger.error(`Lỗi khi đăng ký: ${error.message}`);
      throw error;
    }
  }

  /**
   * Quên mật khẩu - Gửi email reset
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.usersService.findByEmail(
        forgotPasswordDto.email,
      );

      if (!user) {
        // Không tiết lộ thông tin user có tồn tại hay không
        return {
          message:
            'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu.',
        };
      }

      // Tạo reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Token có hiệu lực trong 1 giờ
      const expires = new Date(Date.now() + 3600000);

      // Lưu token vào database
      await this.usersService.saveResetPasswordToken(
        user.email,
        hashedToken,
        expires,
      );

      // Gửi email
      try {
        await this.mailService.sendResetPasswordEmail(
          user.email,
          user.fullName,
          resetToken,
        );
        this.logger.log(`Email đặt lại mật khẩu đã được gửi đến ${user.email}`);
      } catch (emailError) {
        this.logger.error(
          `Không thể gửi email đặt lại mật khẩu: ${emailError.message}`,
        );
        throw new BadRequestException('Không thể gửi email. Vui lòng thử lại sau.');
      }

      return {
        message:
          'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu.',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý quên mật khẩu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      // Hash token từ client
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetPasswordDto.token)
        .digest('hex');

      // Tìm user với token này
      const user = await this.usersService.findByResetToken(hashedToken);

      if (!user) {
        throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
      }

      // Kiểm tra token còn hiệu lực không
      if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
        throw new BadRequestException('Token đã hết hạn');
      }

      // Đặt lại mật khẩu
      await this.usersService.resetPassword(
        user.email,
        resetPasswordDto.newPassword,
      );

      // Gửi email xác nhận
      try {
        await this.mailService.sendPasswordChangedEmail(
          user.email,
          user.fullName,
        );
      } catch (emailError) {
        this.logger.error(
          `Không thể gửi email xác nhận: ${emailError.message}`,
        );
      }

      return {
        message: 'Mật khẩu đã được đặt lại thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi đặt lại mật khẩu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Đăng nhập bằng Google
   */
  async googleLogin(req: any) {
    try {
      if (!req.user) {
        throw new UnauthorizedException('Không thể đăng nhập bằng Google');
      }

      const { googleId, email, fullName, avatar } = req.user;

      // Tạo hoặc cập nhật user
      const user = await this.usersService.createOrUpdateGoogleUser(
        googleId,
        email,
        fullName,
        avatar,
      );

      // Đăng nhập
      return this.login(user);
    } catch (error) {
      this.logger.error(`Lỗi khi đăng nhập Google: ${error.message}`);
      throw error;
    }
  }
}

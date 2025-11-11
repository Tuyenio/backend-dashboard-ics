import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Tạo user mới
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Kiểm tra email đã tồn tại
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.usersRepository.save(user);
  }

  /**
   * Tìm tất cả users
   */
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      select: [
        'id',
        'email',
        'fullName',
        'avatar',
        'mobile',
        'role',
        'status',
        'emailVerified',
        'lastLogin',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  /**
   * Tìm user theo ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user;
  }

  /**
   * Tìm user theo email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Tìm user theo Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { googleId } });
  }

  /**
   * Cập nhật thông tin user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  /**
   * Thay đổi mật khẩu
   */
  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findOne(id);

    if (!user.password) {
      throw new BadRequestException('Tài khoản này không có mật khẩu');
    }

    // Kiểm tra mật khẩu cũ
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    // Hash mật khẩu mới
    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.save(user);
  }

  /**
   * Đặt lại mật khẩu (từ forgot password)
   */
  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersRepository.save(user);
  }

  /**
   * Lưu reset password token
   */
  async saveResetPasswordToken(
    email: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await this.usersRepository.save(user);
  }

  /**
   * Tìm user theo reset token
   */
  async findByResetToken(token: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  /**
   * Cập nhật last login
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
  }

  /**
   * Xác thực email
   */
  async verifyEmail(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    user.emailVerified = true;
    await this.usersRepository.save(user);
  }

  /**
   * Xóa user
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  /**
   * Tạo hoặc cập nhật user từ Google OAuth
   */
  async createOrUpdateGoogleUser(
    googleId: string,
    email: string,
    fullName: string,
    avatar?: string,
  ): Promise<User> {
    let user = await this.findByGoogleId(googleId);

    if (!user) {
      user = await this.findByEmail(email);
    }

    if (user) {
      // Cập nhật thông tin
      user.googleId = googleId;
      user.fullName = fullName;
      user.avatar = avatar || user.avatar;
      user.emailVerified = true;
      return await this.usersRepository.save(user);
    }

    // Tạo user mới
    const newUser = this.usersRepository.create({
      googleId,
      email,
      fullName,
      avatar,
      emailVerified: true,
      role: UserRole.USER,
    });

    return await this.usersRepository.save(newUser);
  }
}

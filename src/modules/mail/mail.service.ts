import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: parseInt(this.configService.get('SMTP_PORT') || '587', 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  /**
   * Gửi email chào mừng khi đăng ký thành công
   */
  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject: '🎉 Chào mừng bạn đến với ICS Dashboard',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              .highlight { color: #667eea; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Chào mừng đến với ICS Dashboard!</h1>
              </div>
              <div class="content">
                <p>Xin chào <strong>${fullName}</strong>,</p>
                
                <p>Cảm ơn bạn đã đăng ký tài khoản tại <span class="highlight">ICS Dashboard</span>. Chúng tôi rất vui mừng được chào đón bạn!</p>
                
                <p>Tài khoản của bạn đã được tạo thành công với email: <strong>${email}</strong></p>
                
                <p><strong>Các tính năng bạn có thể sử dụng:</strong></p>
                <ul>
                  <li>✨ Quản lý thông tin cá nhân</li>
                  <li>🔐 Bảo mật cao với mã hóa mật khẩu</li>
                  <li>📊 Truy cập dashboard chuyên nghiệp</li>
                  <li>🚀 Nhiều tính năng hữu ích khác</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:5002'}/login" class="button">
                    Đăng nhập ngay
                  </a>
                </div>
                
                <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
                
                <p>Trân trọng,<br><strong>Đội ngũ ICS Dashboard</strong></p>
              </div>
              <div class="footer">
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                <p>&copy; 2025 ICS Dashboard. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email chào mừng đã được gửi đến ${email}`);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email chào mừng: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gửi email đặt lại mật khẩu
   */
  async sendResetPasswordEmail(
    email: string,
    fullName: string,
    resetToken: string,
  ): Promise<void> {
    try {
      const resetUrl = `${this.configService.get('FRONTEND_URL') || 'http://localhost:5002'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject: '🔐 Yêu cầu đặt lại mật khẩu - ICS Dashboard',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Đặt lại mật khẩu</h1>
              </div>
              <div class="content">
                <p>Xin chào <strong>${fullName}</strong>,</p>
                
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                
                <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">
                    Đặt lại mật khẩu
                  </a>
                </div>
                
                <p>Hoặc sao chép link sau vào trình duyệt:</p>
                <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">${resetUrl}</p>
                
                <div class="warning">
                  <strong>⚠️ Lưu ý:</strong>
                  <ul style="margin: 10px 0 0 0;">
                    <li>Link này chỉ có hiệu lực trong <strong>1 giờ</strong></li>
                    <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                    <li>Không chia sẻ link này với bất kỳ ai</li>
                  </ul>
                </div>
                
                <p>Trân trọng,<br><strong>Đội ngũ ICS Dashboard</strong></p>
              </div>
              <div class="footer">
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                <p>&copy; 2025 ICS Dashboard. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email đặt lại mật khẩu đã được gửi đến ${email}`);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email đặt lại mật khẩu: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gửi email thông báo mật khẩu đã được thay đổi thành công
   */
  async sendPasswordChangedEmail(
    email: string,
    fullName: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject: '✅ Mật khẩu đã được thay đổi thành công - ICS Dashboard',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Thay đổi mật khẩu thành công</h1>
              </div>
              <div class="content">
                <p>Xin chào <strong>${fullName}</strong>,</p>
                
                <div class="success">
                  <strong>✓ Thành công!</strong>
                  <p style="margin: 10px 0 0 0;">Mật khẩu của bạn đã được thay đổi thành công.</p>
                </div>
                
                <p>Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức để bảo vệ tài khoản của bạn.</p>
                
                <p><strong>Thông tin thay đổi:</strong></p>
                <ul>
                  <li>Thời gian: ${new Date().toLocaleString('vi-VN')}</li>
                  <li>Email: ${email}</li>
                </ul>
                
                <p>Trân trọng,<br><strong>Đội ngũ ICS Dashboard</strong></p>
              </div>
              <div class="footer">
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                <p>&copy; 2025 ICS Dashboard. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email xác nhận thay đổi mật khẩu đã được gửi đến ${email}`);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email xác nhận: ${error.message}`);
      throw error;
    }
  }
}

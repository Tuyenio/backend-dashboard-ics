# ICS Dashboard - Backend API

## 📋 Mô tả

Backend API cho hệ thống ICS Dashboard, được xây dựng với **NestJS**, **TypeORM**, **PostgreSQL (Supabase)**, và các công nghệ hiện đại.

## ✨ Tính năng

### 🔐 Authentication & Authorization
- ✅ Đăng ký tài khoản với validation mạnh mẽ
- ✅ Đăng nhập với email/password
- ✅ Đăng nhập bằng Google OAuth 2.0
- ✅ Quên mật khẩu & đặt lại mật khẩu qua email
- ✅ JWT Token authentication
- ✅ Role-based access control (Admin, User)
- ✅ Rate limiting để chống brute force

### 📧 Email Service
- ✅ Email chào mừng khi đăng ký thành công
- ✅ Email đặt lại mật khẩu với link bảo mật
- ✅ Email xác nhận thay đổi mật khẩu
- ✅ Template email chuyên nghiệp với HTML/CSS

### 🛡️ Bảo mật
- ✅ Mã hóa mật khẩu với bcrypt (salt rounds: 10)
- ✅ JWT Secret key mạnh
- ✅ CORS configuration
- ✅ Rate limiting (10 requests/minute)
- ✅ Input validation với class-validator
- ✅ SQL injection prevention với TypeORM

### 👥 User Management
- ✅ Quản lý thông tin cá nhân
- ✅ Thay đổi mật khẩu
- ✅ Upload avatar
- ✅ Quản lý users (Admin only)

## 🏗️ Cấu trúc dự án

```
backend-dashboard-ics/
├── src/
│   ├── common/               # Shared code
│   │   ├── decorators/      # Custom decorators
│   │   ├── filters/         # Exception filters
│   │   └── guards/          # Custom guards
│   ├── config/              # Configuration files
│   │   ├── database.config.ts
│   │   └── typeorm.config.ts
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── seeds/           # Seed data
│   ├── modules/
│   │   ├── auth/           # Authentication module
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/          # Users module
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   └── mail/           # Mail service
│   │       ├── mail.service.ts
│   │       └── mail.module.ts
│   ├── app.module.ts
│   └── main.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js >= 18.x
- pnpm >= 8.x
- PostgreSQL (Supabase)

### 1. Cài đặt dependencies

```bash
pnpm install
```

### 2. Cấu hình môi trường

File `.env` đã được cấu hình sẵn:

```env
# Server
PORT=5000

# Database (Supabase)
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_USERNAME=postgres.pbffvstsrplsbewavkrj
DB_PASSWORD=123456
DB_NAME=postgres

# JWT
JWT_SECRET=aoI7Yrpia1q6ZgaTb5TZqJPuFrV0RatZZHSyKxCPT7SAfpxyxJd1I4ODJNqBItsO5SFDQ2bGNFez8ia+ryeAuA==

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="ICS Dashboard" <your-email@gmail.com>

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:5002
```

### 3. Chạy migrations để tạo bảng

```bash
pnpm run migration:run
```

### 4. Tạo dữ liệu mẫu (seed)

```bash
pnpm run seed
```

Sau khi chạy seed, bạn sẽ có 3 tài khoản mẫu:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | 12345678@Ab | admin |
| user1@example.com | 12345678@Ab | user |
| user2@example.com | 12345678@Ab | user |

### 5. Chạy server development

```bash
pnpm run start:dev
```

Backend sẽ chạy tại: **http://localhost:5000**

### 6. Build production

```bash
pnpm run build
pnpm run start:prod
```

## 📡 API Endpoints

### Authentication

#### POST `/auth/register`
Đăng ký tài khoản mới

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "password": "Password@123",
  "mobile": "0123456789"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "user",
    "status": "active"
  }
}
```

#### POST `/auth/login`
Đăng nhập

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```

#### POST `/auth/forgot-password`
Quên mật khẩu

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST `/auth/reset-password`
Đặt lại mật khẩu

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewPassword@123"
}
```

#### GET `/auth/google`
Đăng nhập bằng Google (redirect)

#### GET `/auth/google/callback`
Google OAuth callback

#### GET `/auth/me`
Lấy thông tin user hiện tại (cần JWT token)

**Headers:**
```
Authorization: Bearer {jwt_token}
```

### Users

#### GET `/users/profile`
Lấy thông tin profile của user đang đăng nhập

**Headers:**
```
Authorization: Bearer {jwt_token}
```

#### PUT `/users/profile`
Cập nhật thông tin profile

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "avatar": "https://example.com/avatar.jpg",
  "mobile": "0987654321"
}
```

#### PUT `/users/change-password`
Thay đổi mật khẩu

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "oldPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

#### GET `/users`
Lấy danh sách tất cả users (Admin only)

#### GET `/users/:id`
Lấy thông tin user theo ID (Admin only)

#### PUT `/users/:id`
Cập nhật user (Admin only)

#### DELETE `/users/:id`
Xóa user (Admin only)

## 🗃️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  avatar VARCHAR(500),
  mobile VARCHAR(20),
  role ENUM('admin', 'user') DEFAULT 'user',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  emailVerified BOOLEAN DEFAULT false,
  googleId VARCHAR(255),
  resetPasswordToken VARCHAR(255),
  resetPasswordExpires TIMESTAMP,
  verificationToken VARCHAR(255),
  verificationTokenExpires TIMESTAMP,
  lastLogin TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IDX_USER_EMAIL ON users(email);
```

## 🔒 Validation Rules

### Password Requirements
- Tối thiểu 8 ký tự
- Ít nhất 1 chữ hoa
- Ít nhất 1 chữ thường
- Ít nhất 1 số hoặc ký tự đặc biệt

Ví dụ: `Password@123`, `12345678@Ab`

### Email
- Phải là định dạng email hợp lệ

### Mobile
- Phải có 10-11 chữ số
- Chỉ chứa số

## 🛠️ Scripts

```bash
# Development
pnpm run start:dev          # Chạy server development với hot-reload

# Build
pnpm run build              # Build production

# Production
pnpm run start:prod         # Chạy server production

# Database
pnpm run migration:generate # Tạo migration mới
pnpm run migration:run      # Chạy migrations
pnpm run migration:revert   # Revert migration cuối cùng
pnpm run seed              # Chạy seed data

# Testing
pnpm run test              # Chạy unit tests
pnpm run test:e2e          # Chạy end-to-end tests
pnpm run test:cov          # Chạy test coverage

# Linting
pnpm run lint              # Kiểm tra và fix linting issues
pnpm run format            # Format code với Prettier
```

## 📝 Ghi chú

### Email Service
- Email được gửi qua Gmail SMTP
- Cần bật "Less secure app access" hoặc sử dụng App Password
- Email templates được thiết kế responsive và professional

### Security Best Practices
1. **Mật khẩu**: Luôn được hash với bcrypt trước khi lưu
2. **JWT Token**: Có thời hạn 7 ngày
3. **Rate Limiting**: 10 requests/phút để chống brute force
4. **CORS**: Chỉ cho phép frontend từ localhost:5002
5. **Input Validation**: Tất cả input đều được validate

### Database Migrations
- Sử dụng TypeORM migrations để quản lý schema
- Tự động tạo bảng khi chạy `migration:run`
- Hỗ trợ rollback với `migration:revert`

## 🐛 Troubleshooting

### Lỗi kết nối database
```bash
# Kiểm tra thông tin database trong .env
# Đảm bảo Supabase database đang chạy
```

### Lỗi SMTP
```bash
# Kiểm tra SMTP credentials
# Đảm bảo Gmail App Password đúng
```

### Lỗi migrations
```bash
# Build lại project
pnpm run build

# Chạy lại migrations
pnpm run migration:run
```

## 📞 Liên hệ

- Developer: ICS Dashboard Team
- Frontend URL: http://localhost:5002
- Backend URL: http://localhost:5000

## 📄 License

Private - ICS Dashboard Project

---

**Lưu ý**: Đây là dự án nội bộ, vui lòng không chia sẻ credentials ra bên ngoài.

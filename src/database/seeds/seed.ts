import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();

async function seed() {
  // Kết nối database
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await dataSource.initialize();
    console.log('✅ Đã kết nối database');

    // Hash mật khẩu: 12345678@Ab
    const hashedPassword = await bcrypt.hash('12345678@Ab', 10);

    // Tạo 3 user mẫu
    const users = [
      {
        email: 'tt98tuyen@gmail.com',
        fullName: 'Admin User',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        emailVerified: true,
      },
      {
        email: 'nnt11032003@gmail.com',
        fullName: 'Regular User',
        password: hashedPassword,
        role: 'user',
        status: 'active',
        emailVerified: true,
      },
      {
        email: 'tuyenkoikop@gmail.com',
        fullName: 'View Only User',
        password: hashedPassword,
        role: 'user', // Changed from 'view' to 'user' since view role doesn't exist
        status: 'active',
        emailVerified: true,
      },
    ];

    for (const user of users) {
      // Kiểm tra xem user đã tồn tại chưa
      const existingUser = await dataSource.query(
        'SELECT * FROM users WHERE email = $1',
        [user.email],
      );

      if (existingUser.length > 0) {
        console.log(`⚠️  User ${user.email} đã tồn tại, bỏ qua`);
        continue;
      }

      // Thêm user mới
      await dataSource.query(
        `INSERT INTO users (
          "email", 
          "fullName", 
          "password", 
          "role", 
          "status", 
          "emailVerified",
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [
          user.email,
          user.fullName,
          user.password,
          user.role,
          user.status,
          user.emailVerified,
        ],
      );

      console.log(`✅ Đã tạo user: ${user.email} (${user.role})`);
    }

    console.log('\n🎉 Seed data thành công!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin:');
    console.log('   Email: tt98tuyen@gmail.com');
    console.log('   Password: 12345678@Ab');
    console.log('   Role: admin');
    console.log('');
    console.log('👤 User:');
    console.log('   Email: nnt11032003@gmail.com');
    console.log('   Password: 12345678@Ab');
    console.log('   Role: user');
    console.log('');
    console.log('👤 View Only User:');
    console.log('   Email: tuyenkoikop@gmail.com');
    console.log('   Password: 12345678@Ab');
    console.log('   Role: user (view only permissions)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Lỗi khi seed data:', error);
    process.exit(1);
  }
}

seed();

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarAndMobileToUsers1730950000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Avatar và mobile đã có trong migration đầu tiên
    // Migration này để đảm bảo tương thích với các yêu cầu về ảnh
    
    // Thêm comment cho các cột
    await queryRunner.query(`
      COMMENT ON COLUMN users.avatar IS 'URL của ảnh đại diện người dùng';
    `);
    
    await queryRunner.query(`
      COMMENT ON COLUMN users.mobile IS 'Số điện thoại di động';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Không cần xóa comment
  }
}

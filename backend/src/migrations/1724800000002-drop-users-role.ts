import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes the now-unused "role" column (the admin concept was removed
 * from the app). Safe to run on existing databases created by
 * migration 1724800000001.
 */
export class DropUsersRole1724800000002 implements MigrationInterface {
  name = 'DropUsersRole1724800000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `role`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `users` ADD COLUMN `role` varchar(10) NOT NULL DEFAULT 'user'",
    );
  }
}
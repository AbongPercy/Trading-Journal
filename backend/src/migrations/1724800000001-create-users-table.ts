import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the "users" table that backs login/sign-up and the admin
 * dashboard. Runs automatically on startup (migrationsRun: true) or
 * manually with:  npm run migration:run
 */
export class CreateUsersTable1724800000001 implements MigrationInterface {
  name = 'CreateUsersTable1724800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`username\` varchar(50) NOT NULL,
        \`email\` varchar(150) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`role\` varchar(10) NOT NULL DEFAULT 'user',
        \`active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_users_username\` (\`username\`),
        UNIQUE INDEX \`IDX_users_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE \`users\`');
  }
}
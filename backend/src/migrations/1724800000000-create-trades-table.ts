import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The first migration: creates the "trades" table.
 *
 * Run automatically on startup (migrationsRun: true in app.module.ts) or
 * manually with:  npm run migration:run
 */
export class CreateTradesTable1724800000000 implements MigrationInterface {
  name = 'CreateTradesTable1724800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`trades\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`date\` date NOT NULL,
        \`time_taken\` varchar(5) NOT NULL,
        \`currency_pair\` varchar(20) NOT NULL,
        \`direction\` varchar(4) NOT NULL,
        \`lot_size\` decimal(10,2) NOT NULL,
        \`risk_reward_ratio\` varchar(20) NOT NULL,
        \`reason\` text NOT NULL,
        \`status\` varchar(10) NOT NULL DEFAULT 'open',
        \`pnl_amount\` decimal(12,2) NULL,
        \`result_note\` text NULL,
        \`result_locked\` tinyint NOT NULL DEFAULT 0,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE \`trades\`');
  }
}

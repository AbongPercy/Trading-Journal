import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Loads the DB credentials from .env
config();

/**
 * Separate data source used ONLY by the migration CLI commands
 * (npm run migration:run / migration:revert).
 */
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'trade_journal',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});

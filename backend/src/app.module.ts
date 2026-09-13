import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from './trades/trade.entity';
import { User } from './users/user.entity';
import { TradesModule } from './trades/trades.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CreateTradesTable1724800000000 } from './migrations/1724800000000-create-trades-table';
import { CreateUsersTable1724800000001 } from './migrations/1724800000001-create-users-table';
import { DropUsersRole1724800000002 } from './migrations/1724800000002-drop-users-role';

@Module({
  imports: [
    // Loads the .env file and makes DB credentials available via ConfigService
    ConfigModule.forRoot({ isGlobal: true }),

    // Connects to MySQL using the settings from .env
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '3306'), 10),
        username: config.get('DB_USER', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_NAME', 'trade_journal'),
        entities: [Trade, User],
        // In development we run migrations automatically on startup,
        // so the tables are created for you the first time you start the app.
        migrations: [
          CreateTradesTable1724800000000,
          CreateUsersTable1724800000001,
          DropUsersRole1724800000002,
        ],
        migrationsRun: true,
        synchronize: false,
      }),
    }),

    AuthModule,
    UsersModule,
    TradesModule,
  ],
})
export class AppModule {}

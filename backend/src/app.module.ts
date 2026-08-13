import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from './trades/trade.entity';
import { TradesModule } from './trades/trades.module';
import { CreateTradesTable1724800000000 } from './migrations/1724800000000-create-trades-table';

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
        entities: [Trade],
        // In development we run migrations automatically on startup,
        // so the "trades" table is created for you the first time you start the app.
        migrations: [CreateTradesTable1724800000000],
        migrationsRun: true,
        synchronize: false,
      }),
    }),

    TradesModule,
  ],
})
export class AppModule {}

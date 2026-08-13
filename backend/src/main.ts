import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All routes will live under /api, e.g. /api/trades
  app.setGlobalPrefix('api');

  // Allows the React app (different port) to call this API during development
  app.enableCors();

  // Validates incoming request bodies against our DTO classes (see dto/)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  console.log(`Trade Journal API running at http://localhost:${port}/api`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as process from 'node:process';
import compression from 'compression';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { initializeLangfuseTracing } from './instrumentation';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Initialize Langfuse tracing after ConfigService is available
  initializeLangfuseTracing(configService);

  // Trust proxy for proper IP tracking in rate limiting
  app.set('trust proxy', 'loopback');

  const allowedOrigins =
  process.env.FRONTEND_URLS?.split(',')
    .map(origin => origin.trim())
    .filter(Boolean) ?? [];

app.enableCors({
  origin: (requestOrigin, callback) => {
    // Allow curl, Postman, server-to-server requests
    if (!requestOrigin) {
      return callback(null, true);
    }

    // Allow everything outside production
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Allow configured frontends
    if (allowedOrigins.includes(requestOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${requestOrigin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
  
  app.use(compression());
  app.use(cookieParser());
  await app.listen(configService.get('PORT', 4000));
}

bootstrap()
  .then(() => Logger.log(`Server started on ${process.env.PORT ?? 4000}`, 'Bootstrap'))
  .catch((error) => {
    Logger.error(`Failed to start server: ${error}`, 'Bootstrap');
    process.exit(1);
  });

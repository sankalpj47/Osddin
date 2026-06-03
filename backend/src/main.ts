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

  app.enableCors({
    origin: (requestOrigin, callback) => {
      const allowed = process.env.FRONTEND_URL;

      // Allow server-to-server / curl / Postman
      if (!requestOrigin) {
        return callback(null, true);
      }

      if (allowed === requestOrigin || process.env.NODE_ENV != 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
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

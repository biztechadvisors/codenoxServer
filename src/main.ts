import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(cookieParser());

  app.use(helmet());
  app.use(compression());

  app.use(
    session({
      name: process.env.SESSION_NAME || 'sessionName',
      secret: process.env.SESSION_SECRET || 'notagoodsecretnoreallydontusethisone',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  const corsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Marvel')
      .setDescription('Marvel Mock API')
      .setVersion('1.0')
      .addTag('marvel')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);
  Logger.log(`Application is running on: ${await app.getUrl()}/api`);
}

bootstrap();

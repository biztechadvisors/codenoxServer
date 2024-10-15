import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import compression from 'compression';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(cookieParser());

  // Security and performance optimizations
  app.use(helmet());
  app.use(compression());

  // Session handling
  app.use(
    session({
      name: process.env.SESSION_NAME,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
    }),
  );

  // CORS setup - Allowing all origins for API access
  app.enableCors({
    origin: true, // This allows all origins
    credentials: true,
  });

  // Setting global prefix and validation pipes
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  // Swagger setup for development environment
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

  // Starting the application
  const PORT = process.env.PORT;
  await app.listen(PORT);
  Logger.log(`Application is running on: ${await app.getUrl()}/api`);
}

bootstrap();

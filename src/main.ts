/* eslint-disable prettier/prettier */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });

  app.useStaticAssets(join(__dirname, "..", "public"));
  app.use(cookieParser());

  app.use(
    session({
      name: 'sessionName',
      secret: "notagoodsecretnoreallydontusethisone",
      resave: false,
      saveUninitialized: false, // typically set to false to avoid storing empty sessions
      cookie: {
        httpOnly: true,  // Don't let browser JavaScript access cookie ever
        secure: process.env.NODE_ENV === 'production', // Only use cookie over HTTPS in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours for example
      }
    })
  );

  app.use(cors({
    origin: (origin, callback) => {
      callback(null, true); // Accept requests from any origin
    },
    credentials: true, // allow credentials (cookies, authorization headers, TLS client certificates)
  }));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Marvel')
    .setDescription('Marvel Mock API')
    .setVersion('1.0')
    .addTag('marvel')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}/api`);
}

bootstrap();

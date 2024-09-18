import { join } from 'path';
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'mail.codenoxx.com', // Default host if not set in env
        port: parseInt(process.env.MAIL_PORT, 10) || 465, // Default to secure SMTP port 465
        secure: true, // SSL/TLS
        auth: {
          user: process.env.MAIL_USER || 'info@codenoxx.com', // Default user if not set in env
          pass: process.env.MAIL_PASS || 'codenoxx@123', // Default password if not set in env
        },
        tls: {
          rejectUnauthorized: false, // You may want to set this to true in production
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_FROM || 'info@codenoxx.com'}>`, // Default sender
      },
      template: {
        dir: join(__dirname, 'templates'), // Email templates directory
        adapter: new HandlebarsAdapter(), // Template engine
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }

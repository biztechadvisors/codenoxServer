import { join } from 'path';
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';

console.log("Template Directory:", join(__dirname, '..', 'templates'));

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'mail.codenoxx.tech',
        port: 587,
        secure: false, // set to true if you use SSL/TLS
        auth: {
          user: 'info@codenoxx.tech',
          pass: 'codenox@123',
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: '"No Reply" <info@codenoxx.tech>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
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

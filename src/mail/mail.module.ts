/* eslint-disable prettier/prettier */
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { join } from 'path'

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
          rejectUnauthorized: false, // only for testing purposes, remove this in production!
        },
      },
      defaults: {
        from: '"No Reply" <info@codenoxx.tech>',
      },
      template: {
        dir: join(__dirname, '..', 'templates'), // Adjust this path based on your project structure
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },

    }),
  ],
  providers: [MailService],
  exports: [MailService], // 👈 export for DI
})
export class MailModule { }
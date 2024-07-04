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
        secure: false, // set this to true if you are using secure connection
        auth: {
          user: 'info@codenoxx.tech',
          pass: 'codenox@123',
        },
        tls: { rejectUnauthorized: false }, // enable if server does not support TLS
      },
      defaults: {
        from: '"No Reply" <info@codenoxx.tech>',
      },
      template: {
        dir: join(__dirname, '..', 'templates'), // assuming your templates are in the 'templates' folder at the root level of your project
        adapter: new HandlebarsAdapter(), // use Handlebars as the template engine
        options: {
          strict: true, // enable strict mode for Handlebars
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService], // export MailService for dependency injection
})
export class MailModule { }
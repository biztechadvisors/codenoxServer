/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { User } from '../users/entities/user.entity'

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`

    console.log('OTP:', user.otp)

    await this.mailerService.sendMail({
      to: user.email,
      from: '"Support Team" <info@365dgrsol.in>', // override default from
      subject: `Welcome to Tilitso! Confirm your OTP: ${user.otp}`,
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.name,
        otp: user.otp,
        url,
      },
    })
  }
}

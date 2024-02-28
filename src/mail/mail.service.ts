/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { User } from '../users/entities/user.entity'
import { error } from 'console'

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  // OTP send for verify Registration Email
  async sendUserConfirmation(user: User, token: string) {
    const url = `http://localhost:3003/auth/confirm?token=${token}`
    console.log("user******", user)
    console.log("token******", token)
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

  // Resend OTP for verify Registration 
  async resendUserConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`

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

  // send Invoice Email to Vendor
  async sendInvoiceToVendor(user: User, products: any) {

    try {
      const productDetails = products.map((items: any) => ({
        name: items.Name,
        price: items.netPrice,
        imageUrl: items.image
      }));

      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <info@365dgrsol.in>',
        subject: 'New Order Placed',
        template: './invoiceToVendor',
        context: {
          email: user.email,
          products: productDetails
        },
      });
    } catch (error) {
      console.error("Email sending Failed", error)
    }

  }

  // send Invoice Email to Dealer
  async sendInvoiceToDealer(user: User, products: any) {

    try {
      const productDetails = products.map((items: any) => ({
        name: items.Name,
        price: items.netPrice,
        imageUrl: items.image
      }));

      await this.mailerService.sendMail({
        to: user.email,
        from: '"Tilitso Purchase" <info@365dgrsol.in>',
        subject: 'You have order. please check your dashboard for more details',
        template: './invoiceToDealer',
        context: {
          email: user.email,
          products: productDetails,
        },
      });
    } catch (error) {
      console.error("Invoice sending failed to Dealer", error)
    }

  }

  // send Invoice Email to Customer
  async sendInvoiceToCustomer(email: string, products: any) {

    try {
      const productDetails = products.map((items: any) => ({
        name: items.Name,
        price: items.netPrice,
        imageUrl: items.image
      }));
      await this.mailerService.sendMail({
        to: email,
        from: '"Tilitso Purchase" <info@365dgrsol.in>',
        subject: 'Your Tilitso Order Confirmation. Please share your feedback',
        template: './invoiceToCustomer',
        context: {
          email: email,
          products: productDetails,
        },
      });
    } catch (error) {
      console.error("Invoice sending failed to Customer", error)
    }
  }

  // send Email invoice Dealer to Customer
  async sendInvoiceDealerToCustomer(user: User, products: any) {

    try {
      const productDetails = products.map((items: any) => ({
        name: items.Name,
        price: items.netPrice,
        imageUrl: items.image
      }));
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Dealer" <info@365dgrsol.in>',
        subject: 'Your Tilitso Order Confirmation. Please share your feedback',
        template: './invoiceDealerToCustomer',
        context: {
          email: user.email,
          products: productDetails,
        },
      });
    } catch (error) {
      console.error("Invoice sending failed to Customer", error)
    }
  }

  // send Email invoice Dealer to Customer
  async sendUserRefund(user: User, products: any) {

    try {
      const productDetails = products.map((items: any) => ({
        name: items.Name,
        price: items.netPrice,
        imageUrl: items.image
      }));
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Dealer" <info@365dgrsol.in>',
        subject: 'Your Refund amount. Please share your feedback',
        template: './refund',
        context: {
          email: user.email,
          products: productDetails,
        },
      });
    } catch (error) {
      console.error("Invoice sending failed to Customer", error)
    }
  }

  // send Email cancel Order
  async sendCancelOrder(user: User, products: any) {

    try {
      const productDetails = products.map((items: any) => ({
        name: items.Name,
        price: items.netPrice,
        imageUrl: items.image
      }));
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Dealer" <info@365dgrsol.in>',
        subject: 'Your Tilitso Order Confirmation. Please share your feedback',
        template: './',
        context: {
          email: user.email,
          products: productDetails,
        },
      });
    } catch (error) {
      console.error("Invoice sending failed to Customer", error)
    }
  }

  // send Email Transaction Declined
  async sendTransactionDeclined(user: User, products: any) {

    try {
      const productDetails = products.map((items: any) => ({
        name: items.Name,
        price: items.netPrice,
        imageUrl: items.image
      }));
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Dealer" <info@365dgrsol.in>',
        subject: 'Your Tilitso Order Confirmation. Please share your feedback',
        template: './',
        context: {
          email: user.email,
          products: productDetails,
        },
      });
    } catch (error) {
      console.error("Invoice sending failed to Customer", error)
    }
  }

  // Send Abandonment Cart Reminder Email
  async sendAbandonmenCartReminder(email: string, products: any) {

    try {
      const productDetails = products.map((items: any) => ({
        name: items.Name,
        price: items.netPrice,
        imageUrl: items.image
      }));
      const CartUrl = `https://www.tilitso.in/shop-cart`

      await this.mailerService.sendMail({
        to: email,
        from: '"Support Team" <info@365dgrsol.in>',
        subject: 'Don\'t forget your items! ️ Your cart reminder from Tilitso',
        template: './abandonmentCartReminder',
        context: {
          email: email,
          products: productDetails,
          cartUrl: CartUrl,
        },
      });
    } catch (error) {
      console.error("Email sending Failed", error)
    }
  }
}

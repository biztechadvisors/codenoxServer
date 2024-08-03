/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
const { toWords } = require('number-to-words');

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async renderTemplate(data: any, templateName: string) {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = Handlebars.compile(templateContent);
      const renderedTemplate = compiledTemplate(data);

      await this.mailerService.sendMail({
        to: data.finalEmail,
        from: '"Codenox Purchase" <info@codenoxx.tech>',
        subject: 'Your Codenox Order Confirmation. Please share your feedback',
        html: renderedTemplate,
        attachments: [
          {
            filename: 'invoice.pdf',
            // content: pdfBuffer,
            encoding: 'base64',
            contentType: 'application/pdf',
          },
        ],
      });
      return templateContent;
    } catch (err) {
      console.error('Error reading or sending email:', err);
      return null;
    }
  }

  async dealer_renderTemplate(data: any, templateName: string) {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = Handlebars.compile(templateContent);
      const renderedTemplate = compiledTemplate(data);

      await this.mailerService.sendMail({
        to: data.customer.email,
        from: '"Codenox Purchase" <info@codenoxx.tech>',
        subject: 'Your Codenox Order Confirmation. Please share your feedback',
        html: renderedTemplate,
        attachments: [
          {
            filename: 'invoice.pdf',
            // content: pdfBuffer,
            encoding: 'base64',
            contentType: 'application/pdf',
          },
        ],
      });
      return templateContent;
    } catch (err) {
      console.error('Error reading or sending email:', err);
      return null;
    }
  }

  async sendUserConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <info@codenoxx.tech>',
        subject: `Welcome to Codenox! Confirm your OTP: ${user.otp}`,
        template: 'confirmation',
        context: {
          name: user.name,
          otp: user.otp,
          url,
        },
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  }

  async resendUserConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <info@codenoxx.tech>',
        subject: `Welcome to Codenox! Confirm your OTP: ${user.otp}`,
        template: 'confirmation',
        context: {
          name: user.name,
          otp: user.otp,
          url,
        },
      });
    } catch (error) {
      console.error('Error resending confirmation email:', error);
    }
  }

  async forgetPasswordUserConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <info@codenoxx.tech>',
        subject: `Welcome to Codenox! Confirm your Forgot OTP: ${user.otp}`,
        template: 'forgetPassWord',
        context: {
          name: user.name,
          otp: user.otp,
          url,
        },
      });
    } catch (error) {
      console.error('Error sending forgot password email:', error);
    }
  }

  async successfullyRegister(user: User) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <info@codenoxx.tech>',
        subject: `Welcome to Our Platform! Confirm your registration.`,
        template: 'successfullyRegister',
        context: {
          name: user.name,
          email: user.email,
          password: user.password,
          otp: user.otp,
        },
      });
    } catch (error) {
      console.error('Error sending registration success email:', error);
    }
  }

  async sendInvoiceToVendor(user: User, products: any) {
    try {
      const productDetails = products.map((items: any) => ({
        name: items.Name,
        price: items.netPrice,
        imageUrl: items.image,
      }));

      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <info@codenoxx.tech>',
        subject: 'New Order Placed',
        template: 'invoiceToVendor',
        context: {
          email: user.email,
          products: productDetails,
        },
      });
    } catch (error) {
      console.error('Error sending invoice to vendor:', error);
    }
  }

  async sendInvoiceToCustomerORDealer(taxType: any) {
    try {
      const {
        CGST,
        IGST,
        SGST,
        net_amount,
        total_amount,
        shop,
        soldByUserAddress,
        sales_tax_total,
        total_amount_in_words,
        payment_Mode,
        paymentInfo,
        billing_address,
        shipping_address,
        total_tax_amount,
        shop_address,
        products,
        created_at,
        order_no,
        invoice_date,
      } = taxType;

      const totalSubtotal = products.reduce((accumulator: number, currentValue: any) => {
        return accumulator + currentValue.pivot.subtotal;
      }, 0);

      const totalSubtotalInWords = toWords(totalSubtotal);

      const updatedProducts = products.map((product: any) => {
        const unit_price = Number(product.pivot?.unit_price || 0);
        const quantity = Number(product.pivot?.order_quantity || 0);
        const tax_rate = Number(product.taxes?.rate || 0) / 100;
        const subtotal = unit_price * quantity;
        const taxAmount = Math.round(subtotal * tax_rate);
        const total = subtotal + taxAmount;
        return { ...product, subtotal, taxAmount, total };
      });

      const finalEmail = taxType.dealer.email ? taxType.dealer.email : taxType.customer.email;

      const orderDetails = {
        IGST,
        CGST,
        SGST,
        net_amount,
        total_amount,
        shop,
        soldByUserAddress,
        sales_tax_total,
        total_amount_in_words,
        payment_Mode,
        paymentInfo,
        billing_address,
        shipping_address,
        total_tax_amount,
        shop_address,
        finalEmail,
        finalTotal: totalSubtotal,
        amountinWord: totalSubtotalInWords,
        products: updatedProducts,
        created_at,
        order_no,
        invoice_date,
      };

      const htmlContent = await this.renderTemplate(orderDetails, 'invoiceToCustomer');

    } catch (error) {
      console.error('Invoice sending failed to Customer or Dealer:', error);
    }
  }

  async sendInvoiceDealerToCustomer(Invoice: any) {
    try {
      const {
        CGST,
        IGST,
        SGST,
        net_amount,
        total_amount,
        shop,
        soldByUserAddress,
        sales_tax_total,
        total_amount_in_words,
        payment_Mode,
        paymentInfo,
        billing_address,
        shipping_address,
        sales_tax,
        total_tax_amount,
        shop_address,
        customer,
        dealer,
        products,
        created_at,
        order_no,
        invoice_date,
      } = Invoice;

      const totalSubtotal = products.reduce((accumulator: number, currentValue: any) => {
        return accumulator + currentValue.pivot.subtotal;
      }, 0);

      const totalSubtotalInWords = toWords(totalSubtotal);

      const updatedProducts = products.map((product: any) => {
        const unit_price = Number(product.pivot?.unit_price || 0);
        const quantity = Number(product.pivot?.order_quantity || 0);
        const tax_rate = Number(product.taxes?.rate || 0) / 100;
        const subtotal = unit_price * quantity;
        const taxAmount = Math.round(subtotal * tax_rate);
        const total = subtotal + taxAmount;
        return { ...product, subtotal, taxAmount, total };
      });

      const dealerEmail = Invoice.dealer.email ? Invoice.dealer.email : Invoice.customer.email;

      const orderDetails = {
        IGST,
        CGST,
        SGST,
        net_amount,
        total_amount,
        shop,
        soldByUserAddress,
        sales_tax_total,
        total_amount_in_words,
        payment_Mode,
        paymentInfo,
        billing_address,
        shipping_address,
        sales_tax,
        total_tax_amount,
        shop_address,
        dealerEmail,
        finalTotal: totalSubtotal,
        amountinWord: totalSubtotalInWords,
        products: updatedProducts,
        created_at,
        order_no,
        invoice_date,
      };

      const htmlContent = await this.dealer_renderTemplate(orderDetails, 'invoiceToCustomer');
    } catch (error) {
      console.error('Dealer Invoice sending failed:', error);
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
        from: '"Dealer" <info@codenoxx.tech>',
        subject: 'Your Refund amount. Please share your feedback',
        template: '/refund',
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
  async sendCancelOrder(user: User, products: any,) {

    try {
      const productDetails = products.map((items: any) => ({
        name: items.Name,
        price: items.netPrice,
        imageUrl: items.image
      }));
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Dealer" <info@codenoxx.tech>',
        subject: 'Your Codenox Order Confirmation. Please share your feedback',
        template: '/cancelOrder',
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
        from: '"Dealer" <info@codenoxx.tech>',
        subject: 'Your Codenox Order Confirmation. Please share your feedback',
        template: '/transactionDeclined',
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
  async sendAbandonmenCartReminder(email: any, products: any) {

    // Check if products is an array and has elements
    if (!Array.isArray(products) || products.length === 0) {
      console.error("Invalid or empty products array");
      return;
    }

    try {
      // Correctly map product details, ensuring property names match
      const productDetails = products.map(item => ({
        name: item.name,
        price: item.price,
        imageUrl: item.image,
        slug: item.slug
      }));

      const CartUrl = "https://www.Codenox.in/shop-cart";

      await this.mailerService.sendMail({
        to: email,
        from: '"Support Team" <info@codenoxx.tech>',
        subject: "Don't forget your items! ️ Your cart reminder from Codenox",
        template: '/abandonmentCartReminder',
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

  async sendPermissionUserConfirmation(password: any, user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;
    const templatePath = path.join(__dirname, 'templates', 'userbyowner.hbs');
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <info@codenoxx.tech>',
        subject: `Welcome to Codenox!`,
        template: templatePath,
        context: {
          email: user.email,
          password: password,
          name: user.name,
          otp: user.otp,
          permission: user.permission.type_name,
          url,
        },
      });
      console.log('Mail sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
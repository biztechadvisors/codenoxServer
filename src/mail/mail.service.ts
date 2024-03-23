/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { User } from '../users/entities/user.entity'
import { error } from 'console'
// import * as puppeteer from 'puppeteer';
import path from 'path';
const { toWords } = require('number-to-words');
const fs = require('fs');
const Handlebars = require('handlebars');


@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async renderTemplate(data) {
    console.log('Data come or not  = ', data);
    const templatePath = path.join(__dirname, 'templates', 'invoiceToCustomer.hbs'); // Construct absolute path
    // console.log('Template path:', templatePath); // Log absolute path
    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = Handlebars.compile(templateContent);
      const renderedTemplate = compiledTemplate(data);
      console.log('Rendered template:', compiledTemplate);

      // const pdfBuffer = await this.generatePdfFromHtml(renderedTemplate);

      await this.mailerService.sendMail({
        to: data.finalEmail,
        from: '"Tilitso Purchase" <info@365dgrsol.in>',
        subject: 'Your Tilitso Order Confirmation. Please share your feedback',
        html: 'Please see the attached PDF for your order confirmation.',
        template: '/invoiceToCustomer',
        attachments: [
          {
            filename: 'invoice.pdf',
            // content: pdfBuffer,
            encoding: 'base64',
            contentType: 'application/pdf', // Set the content type of the attachment
          },
        ],
      });
      return templateContent;
    } catch (err) {
      console.error('Error reading file:', err);
      return null;
    }
  }

  async dealer_renderTemplate(data) {
    console.log('DataCOMEORNOT  = ', data);
    const templatePath = path.join(__dirname, 'templates', 'invoiceDealerToCustomer.hbs'); // Construct absolute path
    // console.log('Template path:', templatePath); // Log absolute path
    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = Handlebars.compile(templateContent);
      const renderedTemplate = compiledTemplate(data);
      console.log('Rendered template:', compiledTemplate);

      // const pdfBuffer = await this.generatePdfFromHtml(renderedTemplate);

      await this.mailerService.sendMail({
        to: data.customer.email,
        from: '"Tilitso Purchase" <info@365dgrsol.in>',
        subject: 'Your Tilitso Order Confirmation. Please share your feedback',
        html: 'Please see the attached PDF for your order confirmation.',
        template: '/invoiceDealerToCustomer',
        attachments: [
          {
            filename: 'invoice.pdf',
            // content: pdfBuffer,
            encoding: 'base64',
            contentType: 'application/pdf', // Set the content type of the attachment
          },
        ],
      });
      return templateContent;
    } catch (err) {
      console.error('Error reading file:', err);
      return null;
    }
  }

  // OTP send for verify Registration Email
  async sendUserConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`

    console.log('OTP"""""""""""""""":', user.otp)
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

  // OTP for forgetPassword
  async forgetPasswordUserConfirmation(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`

    console.log('OTP:', user.otp)

    await this.mailerService.sendMail({
      to: user.email,
      from: '"Support Team" <info@365dgrsol.in>', // override default from
      subject: `Welcome to Tilitso! Confirm your Forgot OTP: ${user.otp}`,
      template: './forgetPassWord', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.name,
        otp: user.otp,
        url,
      },
    })
  }
  // Successfully Register 
  async successfullyRegister(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      from: '"Support Team" <info@365dgrsol.in>',
      subject: `Welcome to Our Platform! Confirm your registration.`,
      template: './successfullyRegister',
      context: {
        name: user.name,
        email: user.email, // Including the email in the context
        password: user.password, // Including the password in the context, be cautious with this approach
        otp: user.otp,
        // url,
      },
    });
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

  //   async generatePdfFromHtml(htmlString) {
  //     try {
  //         const browser = await puppeteer.launch();
  //         const page = await browser.newPage();
  //         await page.setContent(htmlString);
  //         const pdfBuffer = await page.pdf({ format: 'A4' });
  //         await browser.close();

  //         return pdfBuffer;
  //     } catch (err) {
  //         console.error('Error generating PDF:', err);
  //         return null;
  //     }
  // }

  async sendInvoiceToCustomerORDealer(taxType: any) {
    try {
      const {
        CGST,
        IGST,
        SGST,
        net_amount,
        total_amount,
        shop,
        saleBy,
        sales_tax_total,
        total_amount_in_words,
        payment_Mode,
        paymentInfo,
        billing_address,
        shipping_address,
        total_tax_amount,
        shop_address,
        customer,
        dealer,
        products,
        created_at,
        order_no,
        invoice_date,
      } = taxType;

      console.log('prodcuts-mail-135', total_tax_amount);

      const totalSubtotal = products.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.pivot.subtotal;
      }, 0);

      // Convert subtotal to words
      const totalSubtotalInWords = toWords(totalSubtotal);

      const updatedProducts = products.map(product => {
        const unit_price = Number(product.pivot?.unit_price || 0);
        const quantity = Number(product.pivot?.order_quantity || 0);
        const tax_rate = Number(product.taxes?.rate || 0) / 100;
        const subtotal = unit_price * quantity;
        const taxAmount = Math.round(subtotal * tax_rate);
        const total = subtotal + taxAmount;
        return { ...product, subtotal, taxAmount, total }; // Return the original product data with the new calculated values
      });
      const finalEmail = taxType.dealer.email ? taxType.dealer.email : taxType.customer.email;
      console.log("finalMAILLLLLLLLLLLll", finalEmail);

      const orderDetails = {
        IGST,
        CGST,
        SGST,
        net_amount,
        total_amount,
        shop,
        saleBy,
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
        products: updatedProducts, // Use the updated products
        created_at,
        order_no,
        invoice_date,
      };


      const htmlContent = await this.renderTemplate(orderDetails);
      // console.log("RADHIKA+++++++++++++++++++",htmlContent);

      // Generate PDF from HTML content
      // const pdfBuffer = await this.generatePdfFromHtml(htmlContent);

      // console.log("orderDetails***184", orderDetails);


    } catch (error) {
      console.error("Invoice sending failed to Customer", error);
    }
  }

  // send Email invoice Dealer to Customer
  // async sendInvoiceDealerToCustomer( taxType: any) {
  //   try {
  //     // Destructure taxType directly
  //     const {
  //       CGST,
  //       IGST,
  //       SGST,
  //       net_amount,
  //       total_amount,
  //       shop,
  //       sales_tax_total,
  //       total_amount_in_words,
  //       payment_Mode,
  //       paymentInfo,
  //       billing_address,
  //       shipping_address,
  //       total_tax_amount,
  //       shop_address,
  //       customer,
  //       dealer,
  //       saleBy,
  //       products,
  //       created_at,
  //       order_no,
  //       invoice_date,
  //     } = taxType;

  //     console.log('prodcuts-mail-135', total_tax_amount);

  //     const totalSubtotal = products.reduce((accumulator, currentValue) => {
  //       return accumulator + currentValue.pivot.subtotal;
  //     }, 0);
  //     // Convert subtotal to words
  //     const totalSubtotalInWords = toWords(totalSubtotal);

  //     const updatedProducts = products.map(product => {
  //       const unit_price = Number(product.pivot?.unit_price || 0);
  //       const quantity = Number(product.pivot?.order_quantity || 0);
  //       const tax_rate = Number(product.taxes?.rate || 0) / 100;
  //       const subtotal = unit_price * quantity;
  //       const taxAmount = Math.round(subtotal * tax_rate);
  //       const total = subtotal + taxAmount;
  //       return { ...product, subtotal, taxAmount, total }; 
  //     });

  //     const orderDetails = {
  //       IGST,
  //       CGST,
  //       SGST,
  //       net_amount,
  //       total_amount,
  //       shop,
  //       sales_tax_total,
  //       total_amount_in_words,
  //       payment_Mode,
  //       paymentInfo,
  //       billing_address,
  //       shipping_address,
  //       total_tax_amount,
  //       shop_address,
  //       customer,
  //       dealer,
  //       saleBy,
  //       finalTotal:totalSubtotal,
  //       amountinWord:totalSubtotalInWords,
  //       products: updatedProducts, // Use the updated products
  //       created_at,
  //       order_no,
  //       invoice_date,
  //     };

  //     console.log("orderDetails***184", orderDetails)

  //     await this.mailerService.sendMail({
  //       to: customer.email,
  //       from: '"Tilitso Purchase" <info@365dgrsol.in>',
  //       subject: 'Your Tilitso Order Confirmation. Please share your feedback',
  //       template: './invoiceDealerToCustomer',
  //       context: {
  //         email: customer.email,
  //         invoice: orderDetails,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Invoice sending failed to Customer", error);
  //   }
  // }

  async sendInvoiceDealerToCustomer(Invoice: any) {
    console.log('prodcuts-mail-135########', Invoice);

    try {
      const {
        CGST,
        IGST,
        SGST,
        net_amount,
        total_amount,
        shop,
        saleBy,
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

      // console.log('prodcuts-mail-135########', Invoice);

      const totalSubtotal = products.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.pivot.subtotal;
      }, 0);

      // Convert subtotal to words
      const totalSubtotalInWords = toWords(totalSubtotal);

      const updatedProducts = products.map(product => {
        const unit_price = Number(product.pivot?.unit_price || 0);
        const quantity = Number(product.pivot?.order_quantity || 0);
        const tax_rate = Number(product.taxes?.rate || 0) / 100;
        const subtotal = unit_price * quantity;
        const taxAmount = Math.round(subtotal * tax_rate);
        const total = subtotal + taxAmount;
        return { ...product, subtotal, taxAmount, total }; // Return the original product data with the new calculated values
      });
      const finalEmail = Invoice.dealer.email ? Invoice.dealer.email : Invoice.customer.email;
      console.log("finalMAILLLLLLLLLLLll", finalEmail);

      const orderDetails = {
        IGST,
        CGST,
        SGST,
        net_amount,
        total_amount,
        shop,
        saleBy,
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
        finalTotal: totalSubtotal,
        amountinWord: totalSubtotalInWords,
        products: updatedProducts, // Use the updated products
        created_at,
        order_no,
        invoice_date,
      };

      const htmlContented = await this.dealer_renderTemplate(orderDetails);

    } catch (error) {
      console.error("Invoice sending failed to Customer", error);
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
  async sendCancelOrder(user: User, products: any,) {

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
        template: './cancelOrder',
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
        template: './transactionDeclined',
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
    console.log("==================+++++++++++", email, products);

    // Check if products is an array and has elements
    if (!Array.isArray(products) || products.length === 0) {
      console.error("Invalid or empty products array");
      return; // Exit the function if products is not a valid array
    }

    try {
      // Correctly map product details, ensuring property names match
      const productDetails = products.map(item => ({
        name: item.name, // Assuming the correct property is 'name', not 'Name'
        price: item.price, // Ensure 'netPrice' is the correct property name
        imageUrl: item.image,// Check if 'image' is the correct property for the image URL
        slug: item.slug
      }));

      const CartUrl = "https://www.tilitso.in/shop-cart";
      console.log("mapped data----------------------", email, productDetails);

      await this.mailerService.sendMail({
        // to: "radhikaji.varfa@outlook.com",
        to: email,
        from: '"Support Team" <info@365dgrsol.in>',
        subject: "Don't forget your items! ️ Your cart reminder from Tilitso",
        template: './abandonmentCartReminder',
        context: {
          email: email,
          // email:"radhikaji.varfa@outlook.com",
          products: productDetails,
          cartUrl: CartUrl,
        },
      });
    } catch (error) {
      console.error("Email sending Failed", error)
    }
  }

}
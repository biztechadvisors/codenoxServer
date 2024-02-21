/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { User } from '../users/entities/user.entity'

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

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
async successfullyRegister(user: User ) {
  await this.mailerService.sendMail({
    to: user.email,
    from: '"Support Team" <info@365dgrsol.in>',
    subject: `Welcome to Our Platform! Confirm your registration.`,
    template: './invoiceToVendor',
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
async sendInvoiceToVendor(user: User, products: any){

  try{
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
  }catch(error){
    console.error("Email sending Failed",error)
  }

}

// send Invoice Email to Dealer
async sendInvoiceToDealer(user: User, products: any){
  
   
  try{
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
  }catch(error){
    console.error("Invoice sending failed to Dealer", error)
  }
 
}

// send Invoice Email to Customer

async sendInvoiceToCustomer(taxType:any) {
  // console.log("work", taxType);
 
  try {
    // Destructure taxType directly
    const {
      CGST,
      IGST,
      SGST,
      state_code,
      net_amount,
      total_amount,
      shop,
      sales_tax_total,
      total_amount_in_words,
      payment_Mode,
      paymentInfo, 
      billing_address,
      shipping_address,
      shop_address,
      product, // This is an array of Product objects
      created_at,
     order_no, // Renaming order_id to order_no
      invoice_date,
    } = taxType;
   
    // console.log("type", taxType.product)

    // Use destructured variables to construct orderDetails
    const orderDetails = {
      IGST ,
      CGST,
      SGST,
      state_code,
      net_amount,
      total_amount,
      shop,
      sales_tax_total,
      total_amount_in_words,
      payment_Mode,
      paymentInfo,
      billing_address,
      shipping_address,
      shop_address,
      product, // Directly use the product array
      created_at,
      order_no,
      invoice_date,
    };

    // console.log("first", orderDetails);

    await this.mailerService.sendMail({
      to: "radhikaji.varfa@outlook.com",
      from: '"Tilitso Purchase" <info@365dgrsol.in>',
      subject: 'Your Tilitso Order Confirmation. Please share your feedback',
      template: './invoiceToCustomer',
      context: {
        email: "radhikaji.varfa@outlook.com",
        // email: "rvarfa93@gmail.com",
        invoice: orderDetails, // Pass the entire orderDetails object if the template expects to iterate over its properties
      },
    });
  } catch (error) {
    console.error("Invoice sending failed to Customer", error);
  }
}
// async sendInvoiceToCustomer(email:string, products: any){

//   try{
//     const productDetails = products.map((items: any) => ({
//       name: items.Name,
//       price: items.netPrice,
//       imageUrl: items.image
//     }));
//     await this.mailerService.sendMail({
//       to: email,
//       from: '"Tilitso Purchase" <info@365dgrsol.in>',
//       subject: 'Your Tilitso Order Confirmation. Please share your feedback',
//       template: './invoiceToCustomer',
//       context: {
//         email: email,
//         products: productDetails,
//       },
//     });
//   }catch(error){
//     console.error("Invoice sending failed to Customer", error)
//   }
// }


// send Email invoice Dealer to Customer
async sendInvoiceDealerToCustomer(user: User, products: any){

  try{
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
  }catch(error){
    console.error("Invoice sending failed to Customer", error)
  }
}

// send Email invoice Dealer to Customer
async sendUserRefund(user: User, products: any){

  try{
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
  }catch(error){
    console.error("Invoice sending failed to Customer", error)
  }
}

// send Email cancel Order
async sendCancelOrder(user: User, products: any){

  try{
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
  }catch(error){
    console.error("Invoice sending failed to Customer", error)
  }
}

// send Email Transaction Declined
async sendTransactionDeclined(user: User, products: any){

  try{
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
  }catch(error){
    console.error("Invoice sending failed to Customer", error)
  }
}

  // Send Abandonment Cart Reminder Email
  async sendAbandonmenCartReminder(email:any, products:any) {
    console.log("==================+++++++++++", products);
  
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
        imageUrl: item.image ,// Check if 'image' is the correct property for the image URL
        slug:item.slug
      }));
  
      const CartUrl = "https://www.tilitso.in/shop-cart";
      console.log("mapped data----------------------", email, productDetails);
  
      await this.mailerService.sendMail({
        to: email,
        from: '"Support Team" <info@365dgrsol.in>',
        subject: "Don't forget your items! ️ Your cart reminder from Tilitso",
        template: './abandonmentCartReminder',
        context: {
          email: email,
          products: productDetails,
          cartUrl: CartUrl,
        },
      });
    } catch (error) {
      console.error("Email sending Failed", error);
    }
  }
// async sendAbandonmenCartReminder(email: string, products: any) {
  
//     try{
//       const productDetails = products.map((items: any) => ({
//         name: items.Name,
//         price: items.netPrice,
//         imageUrl: items.image
//     }));
//       const CartUrl = `https://www.tilitso.in/shop-cart`

//       await this.mailerService.sendMail({
//         to: email,
//         from: '"Support Team" <info@365dgrsol.in>',
//         subject: 'Don\'t forget your items! ️ Your cart reminder from Tilitso',
//         template: './abandonmentCartReminder',
//         context: {
//           email: email,
//           products: productDetails,
//           cartUrl: CartUrl,
//         },
//       });
//     }catch(error){
//       console.error("Email sending Failed", error)
//     }
//   }
}

/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import settingJson from '@db/settings.json';
import { Setting } from 'src/settings/entities/setting.entity';
import { plainToClass } from 'class-transformer';
import { InjectStripe } from 'nestjs-stripe';
import paymentGatewayJson from 'src/db/pickbazar/payment-gateway.json';
import { Order } from 'src/orders/entities/order.entity';
import { PaymentGateWay } from 'src/payment-method/entities/payment-gateway.entity';
import { User } from 'src/users/entities/user.entity';
import Stripe from 'stripe';
import {
  CardElementDto,
  CreatePaymentIntentDto,
  StripeCreateCustomerDto,
} from './dto/stripe.dto';
import {
  AddressStripe,
  InvoiceSettings,
  Metadata,
  StripeCustomer,
  StripeCustomerList,
  StripePaymentIntent,
  StripePaymentMethod,
} from './entity/stripe.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from 'src/payment-method/entities/payment-method.entity';
import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity';

const paymentGateways = plainToClass(PaymentGateWay, paymentGatewayJson);
const setting = plainToClass(Setting, settingJson);
@Injectable()
export class StripePaymentService {
  private paymentGateways: PaymentGateWay[] = paymentGateways;

  constructor(@InjectStripe() private readonly stripeClient: Stripe,
  @InjectRepository(InvoiceSettings)
  private readonly invoiceSettingRepository : Repository<InvoiceSettings>,
  @InjectRepository(Metadata)
  private readonly metadataRepository : Repository<Metadata>,
  @InjectRepository(StripeCustomer)
  private readonly stripeCustomerRepository : Repository<StripeCustomer>,
  @InjectRepository(StripePaymentMethod)
  private readonly stripePaymentMethodRepository:Repository<StripePaymentMethod>,
  @InjectRepository(StripeCustomerList)
  private readonly stripeCustomerListRepository : Repository<StripeCustomerList>,
  @InjectRepository(PaymentMethod)
  private readonly paymentMethodRepository : Repository<PaymentMethod>,
  @InjectRepository(StripePaymentIntent)
  private readonly stripePaymentIntentRepository : Repository<StripePaymentIntent>
  ) {}

  /**
   * @param  {StripeCreateCustomerDto} createCustomerDto?
   * @returns Promise
   */
  // async   createCustomer(
  //   createCustomerDto?: StripeCreateCustomerDto,
  // ): Promise<StripeCustomer> {
  //   console.log('createCustomer-Work')
  //   console.log(createCustomerDto)
  //   try {
  //     return this.stripeCustomerRepository.create(createCustomerDto);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async createCustomer(createCustomerDto?: StripeCreateCustomerDto): Promise<StripeCustomerList> {
    try {

      console.log(createCustomerDto)
      const createStripeCustomer = new StripeCreateCustomerDto()
      // createStripeCustomer.address = createCustomerDto.address
      createStripeCustomer.balance = createCustomerDto.balance
      createStripeCustomer.created = createCustomerDto.created
      createStripeCustomer.currency = createCustomerDto.currency
      createStripeCustomer.default_source = createCustomerDto.default_source
      createStripeCustomer.delinquent = createCustomerDto.delinquent
      createStripeCustomer.invoice_prefix = createCustomerDto.invoice_prefix
      createStripeCustomer.livemode = createCustomerDto.livemode
      createStripeCustomer.next_invoice_sequence = createCustomerDto.next_invoice_sequence
      createStripeCustomer.tax_exempt = createCustomerDto.tax_exempt
      createStripeCustomer.description = createCustomerDto.description
      createStripeCustomer.discount = createCustomerDto.discount
      createStripeCustomer.email = createCustomerDto.email
      createStripeCustomer.name = createCustomerDto.name
      createStripeCustomer.phone =createCustomerDto.phone
      createStripeCustomer.preferred_locales = createCustomerDto.preferred_locales
      createStripeCustomer.shipping = createCustomerDto.shipping
      createStripeCustomer.test_clock = createCustomerDto.test_clock
      createStripeCustomer.shipping = createCustomerDto.shipping

      const saveCreateStripeCustomer = await this.stripeCustomerRepository.save(createStripeCustomer)
      return saveCreateStripeCustomer
      
      // return await this.stripeCustomerRepository.save(createCustomerDto);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * @param  {string} id
   * @returns Promise
   */
  // async retrieveCustomer(id: string): Promise<StripeCustomer> {
  //   try {
  //     return await this.stripeClient.customers.retrieve(id);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async retrieveCustomer(id: string): Promise<StripeCustomer | undefined> {
    try {
      const customerId = parseInt(id, 10);
      return await this.stripeCustomerRepository.findOne({ where: { id: customerId } });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  

  /**
   * @returns Promise
   */
  // async listAllCustomer(): Promise<StripeCustomerList[]> {
  //   try {
  //     const apiList = await this.stripeClient.customers.list();
  //     // const apiList = await this.stripeClient.customers.list();
  //     const stripeCustomerList = new StripeCustomerList()
  //     const customerList: StripeCustomer[] = await Promise.all(apiList.data.map(async (customer) => {
  //       const stripeCustomer = new StripeCustomer();
  //       // stripeCustomer.id = Number(customer.id);
  //       stripeCustomer.object = customer.object;
  //       if (customer.address instanceof Array) {
  //         const addressStripes: AddressStripe[] = await Promise.all(customer.address.map(async (address) => {
  //           const addressStripe = new AddressStripe();
  //           addressStripe.city = customer.address.city;
  //           addressStripe.country = customer.address.country;
  //           addressStripe.line1 = customer.address.line1;
  //           addressStripe.line2 = customer.address.line2;
  //           addressStripe.postal_code = customer.address.postal_code;
  //           addressStripe.state = customer.address.state;
            
  //           return await this.invoiceSettingRepository.save(addressStripe);
  //         }));
      
  //         stripeCustomer.invoice_settings = addressStripes;
  //       }
  //       // stripeCustomer.address = customer.address;
  //       stripeCustomer.balance = customer.balance;
  //       stripeCustomer.created = customer.created;
  //       stripeCustomer.currency = customer.currency;
  //       stripeCustomer.default_source = customer.default_source;
  //       stripeCustomer.delinquent = customer.delinquent;
  //       stripeCustomer.description = customer.description;
  //       stripeCustomer.discount = customer.discount;
  //       stripeCustomer.email = customer.email;
  //       stripeCustomer.invoice_prefix = customer.invoice_prefix;
      
  //       if (customer.invoice_settings instanceof Array) {
  //         const invoiceSettings: InvoiceSettings[] = await Promise.all(customer.invoice_settings.map(async (invoiceSettingData) => {
  //           const invoiceSetting = new InvoiceSettings();
  //           invoiceSetting.custom_fields = invoiceSettingData.custom_fields;
  //           invoiceSetting.default_payment_method = invoiceSettingData.default_payment_method;
  //           invoiceSetting.footer = invoiceSettingData.footer;
  //           invoiceSetting.rendering_options = invoiceSettingData.rendering_options;

  //           return await this.invoiceSettingRepository.save(invoiceSetting);
  //         }));

  //         stripeCustomer.invoice_settings = invoiceSettings;
  //       }

  //       stripeCustomer.livemode = customer.livemode
  //       if (customer.metadata instanceof Array) {
  //         const metadata = new Metadata();
  //         metadata.order_tracking_number = customer.metadata[0].order_tracking_number;
  //         stripeCustomer.metadata = await this.metadataRepository.save(metadata);
  //       }
  //       stripeCustomer.name = customer.name
  //       stripeCustomer.next_invoice_sequence = customer.next_invoice_sequence
  //       stripeCustomer.phone = customer.phone
  //       stripeCustomer.preferred_locales = customer.preferred_locales
  //       stripeCustomer.shipping = customer.shipping
  //       stripeCustomer.tax_exempt = customer.tax_exempt
  //       stripeCustomer.test_clock = customer.test_clock
  //       return await this.stripeCustomerRepository.save(stripeCustomer);
  //     }));
      
  //     stripeCustomerList.has_more = apiList.has_more
  //     stripeCustomerList.object = apiList.object
  //     stripeCustomerList.url = apiList.url
  //     stripeCustomerList.data = customerList

  //     return customerList;
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // }

  async listAllCustomer(): Promise<StripeCustomerList> {
    try {
      const apiList = await this.stripeClient.customers.list();
      
      // Assuming stripeCustomerListRepository.find() is required to fetch existing data
      const existingList = await this.stripeCustomerListRepository.find();

      const stripeCustomerList = new StripeCustomerList();
      stripeCustomerList.has_more = apiList.has_more;
      stripeCustomerList.object = apiList.object;
      stripeCustomerList.url = apiList.url;
      console.log(apiList.data)
      // stripeCustomerList.data = existingList.concat(apiList.data);

      return await this.stripeCustomerListRepository.save(stripeCustomerList);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   *
   * @param createStripPaymentMethod
   * @returns StripePaymentMethod
   */
  async createPaymentMethod(
    cardElementDto: CardElementDto,
  ): Promise<StripePaymentMethod> {
    try {
      console.log('createPaymentMethod - work')
      // console.log('createPaymentMethod')
      const paymentMethod = await this.stripePaymentMethodRepository.create({
        type: 'card',
        card: cardElementDto,
      });
      const { ...newPaymentMethod }: StripePaymentMethod = paymentMethod;
      return newPaymentMethod;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @param  {string} id
   * @returns Promise
   */
  async retrievePaymentMethod(
    method_key: string,
  ): Promise<StripePaymentMethod[]> {
    try {
      return await this.stripePaymentMethodRepository.find({where:{object:method_key}, relations:['card']});
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @param  {string} customer
   * @returns Promise
   */
  async retrievePaymentMethodByCustomerId(
    customer: string,
  ): Promise<StripePaymentMethod[]> {
    try {
      const data = await this.stripePaymentMethodRepository.find({where:{customer:customer, type:'card'}})
      return data
      // const { data } = await this.stripeClient.customers.listPaymentMethods(
      //   customer,
      //   {
      //     type: 'card',
      //   },
      // );
      // return data;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Attach a payment method to a customer
   * @param  {string} method_id
   * @param  {string} customer_id
   * @returns Promise
   */
  async attachPaymentMethodToCustomer(
    method_id: string,
    customer_id: string,
    
  ): Promise<StripePaymentMethod> {
    try {
      console.log('attachPaymentMethodToCustomer = Work')
      const stripePaymentMethod = new StripePaymentMethod();
      stripePaymentMethod.id =  Math.floor(Math.random() * 1000) + 1
      stripePaymentMethod.object = method_id;
      stripePaymentMethod.created = new Date().toISOString();
      stripePaymentMethod.livemode = true
      stripePaymentMethod.type = 'card'
      stripePaymentMethod.customer = customer_id;
      // if()

      // stripePaymentMethod.card = card
      // stripePaymentMethod.card. =
      return await this.stripePaymentMethodRepository.save(stripePaymentMethod);
    } catch (error) {
      console.log(error);
    }
  }

  /** Detach a payment method from customer
   * @param  {string} method_id
   * @returns Promise<StripePaymentMethod>
   */
  async detachPaymentMethodFromCustomer(
    method_id: string,
  ): Promise<void> {
    try {
      const paymentMethodToDelete = await this.stripePaymentMethodRepository.findOne({ where: { object: method_id } });
  
      if (paymentMethodToDelete) {
        await this.stripePaymentMethodRepository.remove(paymentMethodToDelete);
      } else {
        throw new Error(`Payment method with id ${method_id} not found.`);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  

  /**
   * Create a Stripe paymentIntent
   * @param createPaymentIntentDto
   */
  async createPaymentIntent(
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<StripePaymentIntent> {
    try {
      console.log(createPaymentIntentDto)
      const paymentIntent = new StripePaymentIntent()
      paymentIntent.amount = createPaymentIntentDto.amount
      paymentIntent.currency = createPaymentIntentDto.currency
      paymentIntent.customer = createPaymentIntentDto.customer
      paymentIntent.payment_method_types = createPaymentIntentDto.payment_method_types
      await this.stripePaymentIntentRepository.save(paymentIntent)
      console.log(paymentIntent)
      return paymentIntent
      // const paymentIntent = await this.stripePaymentIntentRepository.create(
      //   createPaymentIntentDto,
      // );
      // const { ...newIntent }: StripePaymentIntent = paymentIntent;
      // return this.stripePaymentIntentRepository.save(newIntent);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Retrieving Payment Intent from Stripe
   * @param payment_id
   */
  async retrievePaymentIntent(
    payment_id: string,
  ): Promise<StripePaymentIntent> {
    try {
      return await this.stripePaymentIntentRepository[0].find({where:{id:payment_id}});
    } catch (error) {
      console.log(error);
    }
  }

  // async makePaymentIntentParam(order: Order, me: User) {
  //   const customerList = await this.listAllCustomer();
  //   const currentCustomer = customerList.data.find(
  //     (customer: StripeCustomer) => customer.email === me.email,
  //   );
  //   if (!currentCustomer) {
  //     const newCustomer = await this.createCustomer({
  //       name: me.name,
  //       email: me.email,
  //     });
  //     currentCustomer.id = newCustomer.id;
  //   }
  //   return {
  //     customer: currentCustomer.id,
  //     amount: Math.ceil(order.paid_total),
  //     currency: process.env.DEFAULT_CURRENCY || setting.options.currency,
  //     payment_method_types: ['card'],
  //     metadata: {
  //       order_tracking_number: order.tracking_number,
  //     },
  //   };
  // }

  async makePaymentIntentParam(order: Order, me: User) {
    const customerList = await this.stripeCustomerRepository.find();
   console.log('makePaymentIntentParam')
   console.log(customerList[0].email === me.email)
   const currentCustomer = customerList[0].email === me.email
   console.log(customerList[0].name)
   console.log(customerList[0].id)
  
    if (currentCustomer === false) {
      console.log('Work')
      const newCustomer = await this.createCustomer({
        name: me.name,
        email: me.email,
      });
      customerList[0].id = newCustomer.id;
    }
    
    return {
      customer: customerList[0].name,
      amount: 45,
      currency: process.env.DEFAULT_CURRENCY || setting.options.currency,
      payment_method_types: ['card'],
      metadata: {
        order_tracking_number: 'order.tracking_number',
      },
      // customer: customerList[0].name,
      // amount: Math.ceil(order.paid_total),
      // currency: process.env.DEFAULT_CURRENCY || setting.options.currency,
      // payment_method_types: ['card'],
      // metadata: {
      //   order_tracking_number: order.tracking_number,
      // },
    };
  }
}








// import { Injectable } from '@nestjs/common';
// import settingJson from '@db/settings.json';
// import { Setting } from 'src/settings/entities/setting.entity';
// import { plainToClass } from 'class-transformer';
// import { InjectStripe } from 'nestjs-stripe';
// import paymentGatewayJson from 'src/db/pickbazar/payment-gateway.json';
// import { Order } from 'src/orders/entities/order.entity';
// import { PaymentGateWay } from 'src/payment-method/entities/payment-gateway.entity';
// import { User } from 'src/users/entities/user.entity';
// import Stripe from 'stripe';
// import {
//   CardElementDto,
//   CreatePaymentIntentDto,
//   StripeCreateCustomerDto,
// } from './dto/stripe.dto';
// import {
//   StripeCustomer,
//   StripeCustomerList,
//   StripePaymentIntent,
//   StripePaymentMethod,
// } from './entity/stripe.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { PaymentMethod } from 'src/payment-method/entities/payment-method.entity';

// const paymentGateways = plainToClass(PaymentGateWay, paymentGatewayJson);
// // const setting = plainToClass(Setting, settingJson);
// @Injectable()
// export class StripePaymentService {
//   private paymentGateways: PaymentGateWay[] = paymentGateways;

//   constructor(
//   @InjectStripe() private readonly stripeClient: Stripe,
//   @InjectRepository(StripeCustomer)
//   private readonly stripeCustomerRepository : Repository<StripeCustomer>,
//   @InjectRepository(StripeCustomerList)
//   private readonly stripeCustomerListRepository : Repository<StripeCustomerList>,
//   @InjectRepository(StripePaymentMethod)
//   private readonly stripePaymentMethodRepository : Repository<StripePaymentMethod>,
//   @InjectRepository(StripePaymentIntent)
//   private readonly stripePaymentIntentRepository : Repository<StripePaymentIntent>,
//   @InjectRepository(Setting)
//   private readonly settingRepository : Repository<Setting>,
//   // @InjectRepository(StripePaymentMethod)
//   // private readonly PaymentMethodRepository : Repository<PaymentMethod>
//   ) {}

//   /**
//    * @param  {StripeCreateCustomerDto} createCustomerDto?
//    * @returns Promise
//    */
//   // async createCustomer(
//   //   createCustomerDto?: StripeCreateCustomerDto,
//   // ): Promise<StripeCustomer> {
//   //   try {
//   //     return await this.stripeClient.customers.create(createCustomerDto);
//   //   } catch (error) {
//   //     console.log(error);
//   //   }
//   // }
//   async createCustomer(createCustomerDto?: StripeCreateCustomerDto): Promise<StripeCustomer> {
//     try {
//         const stripeCustomer = this.stripeCustomerRepository.create(createCustomerDto);
//         return await this.stripeCustomerRepository.save(stripeCustomer);
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// }

//   /**
//    * @param  {string} id
//    * @returns Promise
//    */
//   // async retrieveCustomer(id: string): Promise<StripeCustomer> {
//   //   try {
//   //     return await this.stripeClient.customers.retrieve(id);
//   //   } catch (error) {
//   //     console.log(error);
//   //   }
//   // }
//   async retrieveCustomer(id: string): Promise<StripeCustomer> {
//     console.log("id = "+ id)
//     try {
//       const response = await this.stripeClient.customers.retrieve(id);
//       console.log(response)
//       return response as unknown as StripeCustomer;
//     } catch (error) {
//       console.log(error);
//       throw error;
//     }
//   }
  

//   /**
//    * @returns Promise
//    */
//   // async listAllCustomer(): Promise<StripeCustomerList> {
//   //   try {

//   //     return await this.stripeClient.customers.list();
//   //   } catch (error) {
//   //     console.log(error);
//   //   }
//   // }

//   async listAllCustomer(): Promise<StripeCustomerList> {
//     try {
//       const apiList = await this.stripeClient.customers.list();
//       console.log('apiList')
//       console.log(apiList.data)
//       if (!apiList.data || apiList.data.length === 0) {
//         console.log('No customers found.');
//         return {
//             object: apiList.object,
//             url: apiList.url,
//             has_more: apiList.has_more,
//             data: [],
//         };
//     }
//        const data: StripeCustomer[] = apiList.data.map((customer) => ({
//         object: customer.object,
//         address: customer.address,
//         balance: customer.balance,
//         created:customer.created,
//         currency: customer.currency,
//         default_source: customer.default_source,
//         delinquent: customer.delinquent,
//         discount: customer.discount,
//         email: customer.email,
//         invoice_prefix: customer.invoice_prefix,
//         livemode: customer.livemode,
//         metadata: customer.metadata,
//         name: customer.name,
//         next_invoice_sequence: customer.next_invoice_sequence,
//         phone: customer.phone,
//         preferred_locales: customer.preferred_locales,
//         shipping: customer.shipping,
//         tax_exempt: customer.tax_exempt,
//         test_clock: customer.test_clock,
//         // id: customer.id, // Assuming 'id' is a property in the Customer object
//       }));

//       const savedStripeCustomerList = await this.stripeCustomerListRepository.save({
//         object: apiList.object,
//         url: apiList.url,
//         has_more: apiList.has_more,
//         data: data,
//     });

//     console.log('Saved to the database:', savedStripeCustomerList);
//     return savedStripeCustomerList;
  
//   //     const stripeCustomerList: StripeCustomerList = {
//   //       object: apiList.object,
//   //       url: apiList.url,
//   //       has_more: apiList.has_more,
//   //       data: data,
//   //     };
//   // console.log(stripeCustomerList)
//   //     return stripeCustomerList;
//     } catch (error) {
//       console.log(error);
//       // Handle the error or throw it if needed
//       throw error;
//     }
//   }

//   /**
//    *
//    * @param createStripPaymentMethod
//    * @returns StripePaymentMethod
//    */
//   async createPaymentMethod(
//     cardElementDto: CardElementDto,
//   ): Promise<StripePaymentMethod> {
//     try {
//       const paymentMethod = await this.stripeClient.paymentMethods.create({
//         type: 'card',
//         card: cardElementDto,
//       });
//       const savedPaymentMethod = await this.stripePaymentMethodRepository.save({
//         id: paymentMethod.id,
//         object: paymentMethod.object,
//         billing_details: paymentMethod.billing_details,
//         created: paymentMethod.created,
//         customer: paymentMethod.customer,
//         livemode: paymentMethod.livemode,
//         metadata: paymentMethod.metadata,
//         type: paymentMethod.type,
//     });

//     console.log('Saved payment method to the database:', savedPaymentMethod);
//     return savedPaymentMethod;
//       // const { ...newPaymentMethod }: StripePaymentMethod = paymentMethod;
//       // return newPaymentMethod;
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   /**
//    * @param  {string} id
//    * @returns Promise
//    */
//   async retrievePaymentMethod(
//     method_key: string,
//   ): Promise<StripePaymentMethod> {
//     try {
//       const paymentMethod = await this.stripeClient.paymentMethods.retrieve(method_key);
//       return this.stripePaymentMethodRepository.save(paymentMethod);
//       // return await this.stripeClient.paymentMethods.retrieve(method_key);
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   /**
//    * @param  {string} customer
//    * @returns Promise
//    */
//   // async retrievePaymentMethodByCustomerId(
//   //   customer: string,
//   // ): Promise<StripePaymentMethod[]> {
//   //   try {
//   //     const { data } = await this.stripeClient.customers.listPaymentMethods(
//   //       customer,
//   //       {
//   //         type: 'card',
//   //       },
//   //     );
//   //     return data;
//   //   } catch (error) {
//   //     console.log(error);
//   //   }
//   // }

//   async retrievePaymentMethodByCustomerId(customer: string): Promise<StripePaymentMethod[]> {
//   try {
//     const paymentMethods = await this.stripePaymentMethodRepository.find({
//       where: { customer: customer, type: 'card' },
//     });
//     return paymentMethods;
//   } catch (error) {
//     console.log(error);
//     // Handle the error or throw it if needed
//     throw error;
//   }
// }


//   /**
//    * Attach a payment method to a customer
//    * @param  {string} method_id
//    * @param  {string} customer_id
//    * @returns Promise
//    */
//   // async attachPaymentMethodToCustomer(
//   //   method_id: string,
//   //   customer_id: string,
//   // ): Promise<StripePaymentMethod> {
//   //   try {
//   //     return await this.PaymentMethodRepository.find(method_id, {
//   //       customer: customer_id,
//   //     });
//   //   } catch (error) {
//   //     console.log(error);
//   //   }
//   // }
//   async attachPaymentMethodToCustomer(
//     method_id: string,
//     customer_id: string,
//   ): Promise<StripePaymentMethod | null> {
//     try {
//       const paymentMethod = await this.stripePaymentMethodRepository.findOne({
//         where: { object: method_id, customer: customer_id },
//       });

//       return paymentMethod || null;
//     } catch (error) {
//       console.error(error);
//       throw new Error('Error attaching payment method to customer.');
//     }
//   }

//   /** Detach a payment method from customer
//    * @param  {string} method_id
//    * @returns Promise<StripePaymentMethod>
//    */
//   async detachPaymentMethodFromCustomer(
//     method_id: string,
//   ): Promise<StripePaymentMethod> {
//     try {
//       return await this.stripeClient.paymentMethods.detach(method_id);
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   /**
//    * Create a Stripe paymentIntent
//    * @param createPaymentIntentDto
//    */
//   async createPaymentIntent(
//     createPaymentIntentDto: CreatePaymentIntentDto,
//   ): Promise<StripePaymentIntent> {
//     try {
//       const paymentIntent = await this.stripeClient.paymentIntents.create(
//         createPaymentIntentDto,
//       );
//       const { ...newIntent }: StripePaymentIntent = paymentIntent;
//       // return this.stripePaymentIntentRepository.save(newIntent)
//       return newIntent;
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   /**
//    * Retrieving Payment Intent from Stripe
//    * @param payment_id
//    */
//   async retrievePaymentIntent(
//     payment_id: string,
//   ): Promise<StripePaymentIntent> {
//     try {
//       return await this.stripeClient.paymentIntents.retrieve(payment_id);
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   async makePaymentIntentParam(order: Order, me: User) {
//     const customerList = await this.listAllCustomer();
//     console.log("first")
//     console.log(customerList.data)

//     let currentCustomer = customerList.data.find(
//       (customer: StripeCustomer) => customer.email === me.email,
//     );
//     console.log('currentCustomer')
//     console.log(currentCustomer)

//     if (!currentCustomer) {
//       const newCustomer = await this.createCustomer({
//         name: me.name,
//         email: me.email,
//       });
//       currentCustomer = newCustomer;
//       // currentCustomer.id = newCustomer.id;
//     }
//     return {
//       customer: currentCustomer.id,
//       amount: Math.ceil(order.paid_total),
//       currency: process.env.DEFAULT_CURRENCY || this.settingRepository[0].options.currency,
//       payment_method_types: ['card'],
//       metadata: {
//         order_tracking_number: order.tracking_number,
//       },
//     };
//   }
// }

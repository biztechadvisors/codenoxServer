/* eslint-disable prettier/prettier */
import paymentGatewayJson from '@db/payment-gateway.json';
import cards from '@db/payment-methods.json';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import {
  StripeCustomer,
  StripePaymentMethod,
} from 'src/payment/entity/stripe.entity';
import { StripePaymentService } from 'src/payment/stripe-payment.service';
import { PaymentGateway, Setting } from 'src/settings/entities/setting.entity';
import { SettingsService } from 'src/settings/settings.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { DefaultCart } from './dto/set-default-card.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
// import { PaymentGateWay } from './entities/payment-gateway.entity';
import { PaymentGatewayType } from 'src/orders/entities/order.entity';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentGateWay } from './entities/payment-gateway.entity';
import { CardElementDto } from 'src/payment/dto/stripe.dto';

const paymentMethods = plainToClass(PaymentMethod, cards);
// const paymentGateways = plainToClass(PaymentGateWay, paymentGatewayJson);
@Injectable()
export class PaymentMethodService {
  // private paymentMethods: PaymentMethod[] = paymentMethods;
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository:Repository<PaymentMethod>,
    @InjectRepository(PaymentGateWay)
    private readonly paymentGatewayRepository:Repository<PaymentGateWay>,
    @InjectRepository(StripePaymentMethod)
    private readonly stripePaymentMethodRepository:Repository<StripePaymentMethod>,
    @InjectRepository(StripeCustomer)
    private readonly stripeCustomerRepository : Repository<StripeCustomer>,
    private readonly authService: AuthService,
    private readonly stripeService: StripePaymentService,
    private readonly settingService: SettingsService,
  ) {}
  private setting: Setting = this.settingService.findAll();

  async create(createPaymentMethodDto: CreatePaymentMethodDto) {
  try {
    // Find default card(s)
    const defaultCards = await this.paymentMethodRepository.find({ where: { default_card: true } });
          console.log('WOrk')
    // If there are no default cards or if the DTO specifies default_card as true, update the DTO
    if (!defaultCards || defaultCards.length === 0 || createPaymentMethodDto.default_card === true) {
      createPaymentMethodDto.default_card = true;

     if (defaultCards && defaultCards.length > 0) {
        await Promise.all(defaultCards.map(async (card) => {
         
          card.default_card = false;
          return card;
        }));
      }
    } else {
    console.log('else Work')
      return;
    }

    const paymentGateway = createPaymentMethodDto.payment_gateways.gateway_name;

    return await this.saveCard(createPaymentMethodDto, paymentGateway);
  } catch (error) {
    console.error(error);
    return this.paymentMethodRepository[0];
  }
}


  findAll() {
    // return this.paymentMethods;
  }

  findOne(id: number) {
    // return this.paymentMethods.find(
    //   (pm: PaymentMethod) => pm.id === Number(id),
    // );
  }

  update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    return this.findOne(id);
  }

  remove(id: number) {
    // const card: PaymentMethod = this.findOne(id);
    // this.paymentMethods = [...this.paymentMethods].filter(
    //   (cards: PaymentMethod) => cards.id !== id,
    // );
    // return card;
  }

  async saveDefaultCart(defaultCart: DefaultCart) {
    const { method_id } = defaultCart;
    const defaultCard = await this.paymentMethodRepository.findOne({ where: { method_key: method_id } });

    if (defaultCard) {
        defaultCard.default_card = true;
        await this.paymentMethodRepository.save(defaultCard);
    } else {
        console.error("Payment method not found");
    }
}

  async savePaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto) {
    const paymentGateway: string = PaymentGatewayType.STRIPE as string;
    try {
      const paymentMethod = new PaymentMethod()
      paymentMethod.default_card = createPaymentMethodDto.default_card
      paymentMethod.fingerprint = createPaymentMethodDto.fingerprint
      paymentMethod.last4 = createPaymentMethodDto.last4
      paymentMethod.expires = createPaymentMethodDto.expires
      paymentMethod.method_key = createPaymentMethodDto.method_key
      paymentMethod.network = createPaymentMethodDto.network
      paymentMethod.origin = createPaymentMethodDto.origin
      paymentMethod.owner_name = createPaymentMethodDto.owner_name
      paymentMethod.created_at = new Date()
      if(createPaymentMethodDto.payment_gateways){
        const paymentGateWay = new PaymentGateWay()
        paymentGateWay.customer_id = createPaymentMethodDto.payment_gateways.customer_id
        paymentGateWay.gateway_name = createPaymentMethodDto.payment_gateways.gateway_name
        paymentGateWay.user_id = createPaymentMethodDto.payment_gateways.user_id
        paymentGateWay.created_at = new Date()
        const savePaymentGateWay = await this.paymentGatewayRepository.save(paymentGateWay)
        paymentMethod.payment_gateways = savePaymentGateWay
        paymentMethod.payment_gateway_id = savePaymentGateWay.id
      } 
      paymentMethod.type = createPaymentMethodDto.type
      paymentMethod.verification_check = createPaymentMethodDto.verification_check

      return this.paymentMethodRepository.save(paymentMethod)
      // return this.saveCard(createPaymentMethodDto, paymentGateway);
    } catch (err) {
      console.log(err);
    }
  }

  async saveCard(
    createPaymentMethodDto: CreatePaymentMethodDto,
    paymentGateway: string,
  ) {
    console.log(createPaymentMethodDto,paymentGateway)
    const { method_key, default_card } = createPaymentMethodDto;
    const defaultCard = this.paymentMethodRepository.find(
      {where:{default_card: default_card }}
      // (card) => card.default_card,
    );
    if (!defaultCard ) {
      createPaymentMethodDto.default_card = true;
    }
    try {
      const retrievedPaymentMethod = await this.stripeService.retrievePaymentMethod(method_key);
      console.log('retrievedPaymentMethod')
      console.log(retrievedPaymentMethod)
      if(retrievedPaymentMethod[0]){
      if (this.paymentMethodAlreadyExists(retrievedPaymentMethod[0].card?.fingerprint)) {
        return this.paymentMethodRepository.find({ where: { method_key: method_key } });
      }
    }else {
        const paymentMethod = await this.makeNewPaymentMethodObject(
          createPaymentMethodDto,
          paymentGateway
        );
    
        return paymentMethod
      }
    } catch (error) {
      console.error(error);
      return null;
    }

    // const retrievedPaymentMethod =
    //   await this.stripeService.retrievePaymentMethod(method_key);
    // if (
    //   this.paymentMethodAlreadyExists(retrievedPaymentMethod.card?.fingerprint)
    // ) {
    //   return this.paymentMethodRepository.find(
    //     {where:{method_key: method_key }}
    //     );
    // } 
    
    // else {
    //   const paymentMethod = await this.makeNewPaymentMethodObject(
    //     createPaymentMethodDto,
    //     paymentGateway,
    //   );
    //   this.paymentMethodRepository[0].push(paymentMethod);
    //   return paymentMethod;
    // }
    switch (paymentGateway) {
      case 'stripe':
        break;
      case 'paypal':
        // TODO
        //paypal code goes here
        break;
      default:
        break;
    }
  }
  
  paymentMethodAlreadyExists(fingerPrint: string) {
    const paymentMethod = this.paymentMethodRepository.find(
      {where:{fingerprint:fingerPrint}}
      // (pMethod: PaymentMethod) => pMethod.fingerprint === fingerPrint,
    );
    if (paymentMethod) {
      return true;
    }
    return false;
  }


  async makeNewPaymentMethodObject(
    createPaymentMethodDto: CreatePaymentMethodDto,
    paymentGateway: string,
  ) {
    console.log(createPaymentMethodDto)
    const { method_key, default_card } = createPaymentMethodDto;
    const { id: user_id, name, email } = this.authService.me();
    const listOfCustomer = await this.stripeCustomerRepository.find();
    // console.log('listOfCustomer')
    console.log(listOfCustomer)
    // console.log(listOfCustomer[0].email === email)
    
    if (!listOfCustomer) {
      const newCustomer = await this.stripeService.createCustomer({
        name,
        email,
      });
      listOfCustomer[0] = newCustomer;
      await this.stripeCustomerRepository.save(listOfCustomer[0])
    }

    const attachedPaymentMethod: StripePaymentMethod =
    await this.stripeService.attachPaymentMethodToCustomer(
      method_key,
      listOfCustomer[0].id.toString(),
    );
    console.log('attachedPaymentMethod')
    console.log(attachedPaymentMethod)
    let customerGateway: PaymentGateWay | undefined = await this.paymentGatewayRepository.findOne({
      where: { user_id: user_id, gateway_name: paymentGateway }
    });
    
    if (!customerGateway) {
      customerGateway = {
        id: Math.floor(Math.random() * 1000) + 1,
        user_id: user_id,
        customer_id: listOfCustomer[0].id.toString(),
        gateway_name: paymentGateway,
        created_at: new Date(),
        updated_at: new Date(),
      };
    
      await this.paymentGatewayRepository[0].save(customerGateway );
    }
    console.log('paymentMethod====Work')
    const paymentMethod = new PaymentMethod()
    paymentMethod.method_key = method_key,
    paymentMethod.payment_gateway_id = customerGateway.id,
    paymentMethod.default_card = default_card,
    paymentMethod.fingerprint = "0", //attachedPaymentMethod.card.fingerprint
    paymentMethod.owner_name = attachedPaymentMethod.billing_details.name,
    paymentMethod.last4 = attachedPaymentMethod.card.last4,
    paymentMethod.expires = `${attachedPaymentMethod.card.exp_month}/${attachedPaymentMethod.card.exp_year}`,
    paymentMethod.network = attachedPaymentMethod.card.brand,
    paymentMethod.type = attachedPaymentMethod.card.funding,
    paymentMethod.origin = attachedPaymentMethod.card.country,
    paymentMethod.verification_check = attachedPaymentMethod.card.checks.cvc_check

    // const savePaymentMethod = await this.paymentMethodRepository.save(paymentMethod)
    // console.log(savePaymentMethod)
    // await this.paymentMethodRepository.save(paymentMethod)
    // console.log(PaymentMethodSave)
    return paymentMethod;
    // console.log(listOfCustomer)
  //   let currentCustomer = listOfCustomer.data.find((customer: StripeCustomer) => {
  //     return customer.email === email;
  // });
  // console.log(currentCustomer)
  
  //   if (!currentCustomer) {
  //     const newCustomer = await this.stripeService.createCustomer({
  //       name,
  //       email,
  //     });
  //     currentCustomer = newCustomer;
  //   }
  //   // console.log(currentCustomer)

  //   function generateRandomId(): number {
  //     return Math.floor(Math.random() * 1000) + 1;
  //   }
    
  //   const attachedPaymentMethod: StripePaymentMethod =
  //     await this.stripeService.attachPaymentMethodToCustomer(
  //       method_key,
  //       currentCustomer.name,
  //     );
  //     console.log('attachedPaymentMethod')
  //     console.log(attachedPaymentMethod)
  //     try {
  //       const customerGateway = await this.paymentGatewayRepository.find({
  //         where: { user_id: user_id, gateway_name: paymentGateway },
  //       });
    
  //       const paymentMethod: PaymentMethod = {
  //         id: generateRandomId(),
  //         method_key: method_key,
  //         payment_gateway_id: customerGateway[0].id,
  //         default_card: default_card,
  //         fingerprint: attachedPaymentMethod.card?.fingerprint,
  //         owner_name: attachedPaymentMethod.billing_details?.name,
  //         last4: attachedPaymentMethod.card?.last4,
  //         expires: `${attachedPaymentMethod.card?.exp_month}/${attachedPaymentMethod.card?.exp_year}`,
  //         network: attachedPaymentMethod.card?.brand,
  //         type: attachedPaymentMethod.card?.funding,
  //         origin: attachedPaymentMethod.card?.country,
  //         verification_check: attachedPaymentMethod.card?.checks.cvc_check,
  //         created_at: new Date(),
  //         updated_at: new Date(),
  //       };
        
  //       console.log(paymentMethod);
        
  //       return this.paymentMethodRepository.save(paymentMethod as PaymentMethod);
  //   // return paymentMethod;
  //       // console.log(customerGateway);
  //     } catch (error) {
  //       console.error(error);
  //       // Handle errors
  //     }
  //     // console.log( method_key + currentCustomer.id)
  //   // const customerGateway = this.paymentGatewayRepository.find(
  //   //   { where: { user_id: user_id, gateway_name: paymentGateway }}
  //   // );
  //   // console.log('customerGateway')
  //   // console.log(customerGateway)
  //   // console.log(user_id + paymentGateway)
  //   // if (Array.isArray(customerGateway)) {
  //   //   console.log(customerGateway)
  //   //   customerGateway = customerGateway;
  //   // }
  //   // if (!customerGateway[0]) {
  //   //   customerGateway[0] = {
  //   //     id: Number(Date.now()),
  //   //     user_id: user_id,
  //   //     customer_id: currentCustomer.id,
  //   //     gateway_name: paymentGateway,
  //   //     created_at: new Date(),
  //   //     updated_at: new Date(),
  //   //   };
  //   //   return
  //   //   // this.paymentGatewayRepository[0].push(customerGateway[0]);
  //   // }
    
  //   // console.log(paymentMethod)
  //   // return paymentMethod;
  }
  
}
// function InjectableRepository(): (target: typeof PaymentMethodService, propertyKey: undefined, parameterIndex: 0) => void {
//   throw new Error('Function not implemented.');
// }


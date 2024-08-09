/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { AuthService } from 'src/auth/auth.service'
import {
  StripeCustomer,
  StripePaymentMethod,
} from 'src/payment/entity/stripe.entity';
import { StripePaymentService } from 'src/payment/stripe-payment.service';
import { Setting } from 'src/settings/entities/setting.entity';
import { SettingsService } from 'src/settings/settings.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { DefaultCart } from './dto/set-default-card.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentGateWay } from './entities/payment-gateway.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentGatewayType } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PaymentMethodService {
  private paymentMethods: PaymentMethod
  constructor(
    private readonly authService: AuthService,
    private readonly stripeService: StripePaymentService,
    private readonly settingService: SettingsService,
  ) { }
  // private setting: Setting = this.settingService.findAll();

  async create(createPaymentMethodDto: CreatePaymentMethodDto, user: User) {
    try {
      const defaultCard = []
      const paymentGateway: string = PaymentGatewayType.STRIPE as string;
      return await this.saveCard(createPaymentMethodDto, paymentGateway, user);
    } catch (error) {
      console.log(error)
      return this.paymentMethods[0]
    }
  }

  findAll() {
    return this.paymentMethods
  }

  findOne(id: number) {
    return []
  }

  update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    return this.findOne(id)
  }

  remove(id: number) {
    return []
  }

  saveDefaultCart(defaultCart: DefaultCart) {
    return []
  }

  async savePaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto, user: User) {
    const paymentGateway: string = PaymentGatewayType.STRIPE as string;
    try {
      return this.saveCard(createPaymentMethodDto, paymentGateway, user);
    } catch (err) {
      console.log(err)
    }
  }

  async saveCard(
    createPaymentMethodDto: CreatePaymentMethodDto,
    paymentGateway: string,
    user: User
  ) {
    const { method_key, default_card } = createPaymentMethodDto

    const retrievedPaymentMethod =
      await this.stripeService.retrievePaymentMethod(method_key)
    if (
      this.paymentMethodAlreadyExists(retrievedPaymentMethod.card.fingerprint)
    )
      switch (paymentGateway) {
        case 'stripe':
          break
        case 'paypal':
          // TODO
          //paypal code goes here
          break
        default:
          break
      }
  }
  paymentMethodAlreadyExists(fingerPrint: string) {
    return false
  }

  async makeNewPaymentMethodObject(
    createPaymentMethodDto: CreatePaymentMethodDto,
    paymentGateway: string,
    user: User
  ) {
    const { method_key, default_card } = createPaymentMethodDto;
    const { id: user_id, name, email } = await this.authService.me(user.email, user.id);
    const listofCustomer = await this.stripeService.listAllCustomer();
    let currentCustomer = listofCustomer.data.find(
      (customer: StripeCustomer) => customer.email === email,
    )
    if (!currentCustomer) {
      const newCustomer = await this.stripeService.createCustomer({
        name,
        email,
      })
      currentCustomer = newCustomer
    }
    const attachedPaymentMethod: StripePaymentMethod =
      await this.stripeService.attachPaymentMethodToCustomer(
        method_key,
        currentCustomer.id,
      )
    const paymentMethod: PaymentMethod = {
      id: Number(Date.now()),
      method_key: method_key,
      payment_gateway_id: 1,
      default_card: default_card,
      fingerprint: attachedPaymentMethod.card.fingerprint,
      owner_name: attachedPaymentMethod.billing_details.name,
      last4: attachedPaymentMethod.card.last4,
      expires: `${attachedPaymentMethod.card.exp_month}/${attachedPaymentMethod.card.exp_year}`,
      network: attachedPaymentMethod.card.brand,
      type: attachedPaymentMethod.card.funding,
      origin: attachedPaymentMethod.card.country,
      verification_check: attachedPaymentMethod.card.checks.cvc_check,
      created_at: new Date(),
      updated_at: new Date(),
    }
    return paymentMethod
  }
}
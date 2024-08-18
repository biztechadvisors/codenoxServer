/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { StripeCustomer, StripePaymentMethod } from 'src/payment/entity/stripe.entity';
import { StripePaymentService } from 'src/payment/stripe-payment.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { DefaultCart } from './dto/set-default-card.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentGatewayType } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetPaymentMethodsDto } from './dto/get-payment-methods.dto';

@Injectable()
export class PaymentMethodService {
  constructor(
    private readonly authService: AuthService,
    private readonly stripeService: StripePaymentService,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) { }

  async create(createPaymentMethodDto: CreatePaymentMethodDto, user: User) {
    try {
      const paymentGateway: string = PaymentGatewayType.STRIPE as string;
      return await this.saveCard(createPaymentMethodDto, paymentGateway, user);
    } catch (error) {
      console.log(error);
      throw new Error('Error creating payment method');
    }
  }

  async findAll(query: GetPaymentMethodsDto): Promise<PaymentMethod[]> {
    const { text } = query;

    const whereClause = text ? { owner_name: ILike(`%${text}%`) } : {};

    return this.paymentMethodRepository.find({
      where: whereClause,
    });
  }

  async findOne(id: number) {
    return this.paymentMethodRepository.findOne({ where: { id: id } });
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    const paymentMethod = await this.paymentMethodRepository.preload({
      id: id,
      ...updatePaymentMethodDto,
    });
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async remove(id: number) {
    const paymentMethod = await this.findOne(id);
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }
    return this.paymentMethodRepository.remove(paymentMethod);
  }

  async saveDefaultCart(defaultCart: DefaultCart) {
    let paymentMethod: PaymentMethod | undefined;

    // Use method_id (which is now a number) to find the payment method
    paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: defaultCart.method_id },
    });

    if (paymentMethod) {
      paymentMethod.default_card = true;
      return this.paymentMethodRepository.save(paymentMethod);
    } else {
      throw new Error('Payment method not found.');
    }
  }

  async savePaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto, user: User) {
    const paymentGateway: string = PaymentGatewayType.STRIPE as string;
    try {
      return this.saveCard(createPaymentMethodDto, paymentGateway, user);
    } catch (err) {
      console.log(err);
      throw new Error('Error saving payment method');
    }
  }

  async saveCard(
    createPaymentMethodDto: CreatePaymentMethodDto,
    paymentGateway: string,
    user: User
  ) {
    const { method_key, default_card } = createPaymentMethodDto;
    const retrievedPaymentMethod = await this.stripeService.retrievePaymentMethod(method_key);
    if (this.paymentMethodAlreadyExists(retrievedPaymentMethod.card.fingerprint)) {
      switch (paymentGateway) {
        case 'stripe':
          break;
        case 'paypal':
          // TODO: Implement PayPal logic
          break;
        default:
          break;
      }
    } else {
      const paymentMethod = await this.makeNewPaymentMethodObject(createPaymentMethodDto, paymentGateway, user);
      return this.paymentMethodRepository.save(paymentMethod);
    }
  }

  paymentMethodAlreadyExists(fingerPrint: string) {
    return this.paymentMethodRepository.findOne({ where: { fingerprint: fingerPrint } }) !== null;
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
    );
    if (!currentCustomer) {
      const newCustomer = await this.stripeService.createCustomer({ name, email });
      currentCustomer = newCustomer;
    }
    const attachedPaymentMethod: StripePaymentMethod =
      await this.stripeService.attachPaymentMethodToCustomer(method_key, currentCustomer.id);
    const paymentMethod: PaymentMethod = {
      id: Number(Date.now()),
      method_key: method_key,
      payment_gateway_id: 1, // Adjust based on actual logic
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
    };
    return paymentMethod;
  }
}

/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectStripe } from 'nestjs-stripe';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import Stripe from 'stripe';
import {
    CardElementDto,
    CreatePaymentIntentDto,
    StripeCreateCustomerDto,
} from './dto/stripe.dto';
import {
    StripeCustomer,
    StripeCustomerList,
    StripePaymentIntent,
    StripePaymentMethod,
} from './entity/stripe.entity';

@Injectable()
export class StripePaymentService {
    constructor(
        @InjectStripe() private readonly stripeClient: Stripe,
    ) { }

    async createCustomer(createCustomerDto?: StripeCreateCustomerDto): Promise<StripeCustomer> {
        try {
            return await this.stripeClient.customers.create(createCustomerDto);
        } catch (error) {
            throw new HttpException(`Failed to create Stripe customer: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async retrieveCustomer(id: string): Promise<StripeCustomer> {
        try {
            return await this.stripeClient.customers.retrieve(id);
        } catch (error) {
            throw new HttpException(`Failed to retrieve Stripe customer: ${error.message}`, HttpStatus.NOT_FOUND);
        }
    }

    async listAllCustomer(): Promise<StripeCustomerList> {
        try {
            return await this.stripeClient.customers.list();
        } catch (error) {
            throw new HttpException(`Failed to list Stripe customers: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createPaymentMethod(cardElementDto: CardElementDto): Promise<StripePaymentMethod> {
        try {
            const paymentMethod = await this.stripeClient.paymentMethods.create({
                type: 'card',
                card: cardElementDto,
            });
            return paymentMethod as StripePaymentMethod;
        } catch (error) {
            throw new HttpException(`Failed to create payment method: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    async retrievePaymentMethod(method_key: string): Promise<StripePaymentMethod> {
        try {
            return await this.stripeClient.paymentMethods.retrieve(method_key);
        } catch (error) {
            throw new HttpException(`Failed to retrieve payment method: ${error.message}`, HttpStatus.NOT_FOUND);
        }
    }

    async retrievePaymentMethodByCustomerId(customer: string): Promise<StripePaymentMethod[]> {
        try {
            const { data } = await this.stripeClient.customers.listPaymentMethods(customer, {
                type: 'card',
            });
            return data;
        } catch (error) {
            throw new HttpException(`Failed to retrieve payment methods by customer: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async attachPaymentMethodToCustomer(method_id: string, customer_id: string): Promise<StripePaymentMethod> {
        try {
            return await this.stripeClient.paymentMethods.attach(method_id, {
                customer: customer_id,
            });
        } catch (error) {
            throw new HttpException(`Failed to attach payment method to customer: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    async detachPaymentMethodFromCustomer(method_id: string): Promise<StripePaymentMethod> {
        try {
            return await this.stripeClient.paymentMethods.detach(method_id);
        } catch (error) {
            throw new HttpException(`Failed to detach payment method from customer: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<StripePaymentIntent> {
        try {
            const paymentIntent = await this.stripeClient.paymentIntents.create(createPaymentIntentDto);
            return paymentIntent as StripePaymentIntent;
        } catch (error) {
            throw new HttpException(`Failed to create payment intent: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    async retrievePaymentIntent(payment_id: string): Promise<StripePaymentIntent> {
        try {
            return await this.stripeClient.paymentIntents.retrieve(payment_id);
        } catch (error) {
            throw new HttpException(`Failed to retrieve payment intent: ${error.message}`, HttpStatus.NOT_FOUND);
        }
    }

    async makePaymentIntentParam(order: Order, me: User) {
        try {
            const customerList = await this.listAllCustomer();
            let currentCustomer = customerList.data.find((customer: StripeCustomer) => customer.email === me.email);

            if (!currentCustomer) {
                const newCustomer = await this.createCustomer({
                    name: me.name,
                    email: me.email,
                });
                currentCustomer = newCustomer;
            }

            return {
                customer: currentCustomer.id,
                amount: Math.ceil(order.paid_total),
                currency: process.env.DEFAULT_CURRENCY || 'usd',
                payment_method_types: ['card'],
                metadata: {
                    order_tracking_number: order.tracking_number,
                },
            };
        } catch (error) {
            throw new HttpException(`Failed to create payment intent parameters: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

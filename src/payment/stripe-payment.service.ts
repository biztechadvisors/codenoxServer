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
    StripePaymentIntent,
    StripePaymentMethod,
} from './entity/stripe.entity';

@Injectable()
export class StripePaymentService {
    constructor(
        @InjectStripe() private readonly stripeClient: Stripe,
    ) { }

    async createCustomer(createCustomerDto: StripeCreateCustomerDto): Promise<StripeCustomer> {
        try {
            const customer = await this.stripeClient.customers.create({
                description: createCustomerDto.description,
                name: createCustomerDto.name,
                email: createCustomerDto.email,
                address: createCustomerDto.address,
            });
            return customer as unknown as StripeCustomer;
        } catch (error) {
            throw new HttpException(`Failed to create Stripe customer: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async retrieveCustomer(id: string): Promise<StripeCustomer> {
        try {
            const customer = await this.stripeClient.customers.retrieve(id);
            return customer as unknown as StripeCustomer;
        } catch (error) {
            throw new HttpException(`Failed to retrieve Stripe customer: ${error.message}`, HttpStatus.NOT_FOUND);
        }
    }

    async listAllCustomers(): Promise<StripeCustomer[]> {
        try {
            const customers = await this.stripeClient.customers.list();
            return customers.data as unknown as StripeCustomer[];
        } catch (error) {
            throw new HttpException(`Failed to list Stripe customers: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createPaymentMethod(cardElementDto: CardElementDto): Promise<StripePaymentMethod> {
        try {
            const paymentMethod = await this.stripeClient.paymentMethods.create({
                type: 'card',
                card: {
                    number: cardElementDto.number,
                    exp_month: cardElementDto.exp_month,
                    exp_year: cardElementDto.exp_year,
                    cvc: cardElementDto.cvc,
                },
            });
            return paymentMethod as unknown as StripePaymentMethod;
        } catch (error) {
            throw new HttpException(`Failed to create payment method: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    async retrievePaymentMethod(method_id: string): Promise<StripePaymentMethod> {
        try {
            const paymentMethod = await this.stripeClient.paymentMethods.retrieve(method_id);
            return paymentMethod as unknown as StripePaymentMethod;
        } catch (error) {
            throw new HttpException(`Failed to retrieve payment method: ${error.message}`, HttpStatus.NOT_FOUND);
        }
    }

    async retrievePaymentMethodsByCustomer(customer_id: string): Promise<StripePaymentMethod[]> {
        try {
            const { data } = await this.stripeClient.customers.listPaymentMethods(customer_id, { type: 'card' });
            return data as unknown as StripePaymentMethod[];
        } catch (error) {
            throw new HttpException(`Failed to retrieve payment methods by customer: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async attachPaymentMethodToCustomer(method_id: string, customer_id: number): Promise<StripePaymentMethod> {
        try {
            const paymentMethod = await this.stripeClient.paymentMethods.attach(method_id, { customer: String(customer_id) });
            return paymentMethod as unknown as StripePaymentMethod;
        } catch (error) {
            throw new HttpException(`Failed to attach payment method to customer: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    async detachPaymentMethodFromCustomer(method_id: string): Promise<StripePaymentMethod> {
        try {
            const paymentMethod = await this.stripeClient.paymentMethods.detach(method_id);
            return paymentMethod as unknown as StripePaymentMethod;
        } catch (error) {
            throw new HttpException(`Failed to detach payment method from customer: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<StripePaymentIntent> {
        try {
            const paymentIntent = await this.stripeClient.paymentIntents.create({
                amount: createPaymentIntentDto.amount,
                currency: createPaymentIntentDto.currency,
                payment_method_types: ['card'],
            });
            return paymentIntent as unknown as StripePaymentIntent;
        } catch (error) {
            throw new HttpException(`Failed to create payment intent: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    async retrievePaymentIntent(payment_id: string): Promise<StripePaymentIntent> {
        try {
            const paymentIntent = await this.stripeClient.paymentIntents.retrieve(payment_id);
            return paymentIntent as unknown as StripePaymentIntent;
        } catch (error) {
            throw new HttpException(`Failed to retrieve payment intent: ${error.message}`, HttpStatus.NOT_FOUND);
        }
    }

    async createPaymentIntentParams(order: Order, user: User) {
        try {
            const customerList = await this.listAllCustomers();
            let currentCustomer = customerList.find(customer => customer.email === user.email);

            if (!currentCustomer) {
                currentCustomer = await this.createCustomer({
                    name: user.name,
                    email: user.email,
                });
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

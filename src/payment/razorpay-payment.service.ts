import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, PaymentStatusType } from 'src/orders/entities/order.entity';
import { Card, Payment } from './entity/razorpay.entity';
import { Repository } from 'typeorm';
const Razorpay = require('razorpay');

@Injectable()
export class RazorpayService {
    private razorpay: any;
    private key_secret: any;

    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(Card)
        private cardRepository: Repository<Card>,
    ) {
        this.key_secret = process.env.RAZORPAY_KEY_SECRET;
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: this.key_secret,  // Use 'this.key_secret'
        });
    }

    async createPaymentIntent(order: Order) {
        try {
            const options = {
                amount: Math.floor(order.amount * 100),
                currency: 'INR',
                payment_capture: 1,
            };
            const razorpayOrder = await this.razorpay.orders.create(options);
            const redirect_url = razorpayOrder.notes?.redirect_url?.toString() || '';  // Ensure it's a string

            return {
                client_secret: this.key_secret,
                redirect_url,
                id: razorpayOrder.id,
            };
        } catch (err) {
            console.error(err);
            throw new HttpException(new Error(err.message), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async verifyOrder(razorpay_payment_id: string) {
        try {
            const payment = await this.razorpay.payments.fetch(razorpay_payment_id);
            await this.saveRazorPayRes(payment);
            return { payment };
        } catch (err) {
            throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async saveRazorPayRes(payment: any) {
        try {
            const card = new Card();
            card.last4 = payment.card.last4;
            card.network = payment.card.network;
            card.razorPay_id = payment.card.id;
            card.type = payment.card.type;

            const cardEntity = this.cardRepository.create(card);
            await this.cardRepository.save(cardEntity);

            const paymentEntity = this.paymentRepository.create({
                ...payment,
                card: cardEntity,
            });

            await this.paymentRepository.save(paymentEntity);
            return true;
        } catch (err) {
            throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

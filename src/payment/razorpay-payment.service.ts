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
            key_secret: process.env.RAZORPAY_KEY_SECRET,
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
            let redirect_url = null;
            if (razorpayOrder && razorpayOrder.notes && razorpayOrder.notes.redirect_url) {
                redirect_url = razorpayOrder.notes.redirect_url;
            }
            return {
                client_secret: this.key_secret,
                redirect_url: redirect_url,
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
            this.saveRazorPayRes(payment)
            return {
                payment: payment
            };
        } catch (err) {
            throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async saveRazorPayRes(payment: any) {
        try {
            // Create a new Card entity
            const card = new Card()
            card.last4 = payment.card.last4;
            card.network = payment.card.network;
            card.razorPay_id = payment.card.id;
            card.type = payment.card.type;

            const cardEntity = this.cardRepository.create(card);

            // Save the Card entity in the database
            await this.cardRepository.save(cardEntity);

            // Create a new Payment entity
            const paymentEntity = this.paymentRepository.create({
                ...payment,
                card: cardEntity,  // Associate the saved Card entity with the Payment
            });

            // Save the Payment entity in the database
            await this.paymentRepository.save(paymentEntity);
            return true
        } catch (err) {
            throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}

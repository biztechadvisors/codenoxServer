import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Order, PaymentStatusType } from 'src/orders/entities/order.entity';
const Razorpay = require('razorpay');

@Injectable()
export class RazorpayService {
    private razorpay: any;
    private key_secret: any;
    constructor() {
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
            console.log("option********razorpay", options)
            const razorpayOrder = await this.razorpay.orders.create(options); // renamed variable here
            console.log("order**razorPay", razorpayOrder) // and here
            let redirect_url = null;
            if (razorpayOrder && razorpayOrder.notes && razorpayOrder.notes.redirect_url) { // and here
                redirect_url = razorpayOrder.notes.redirect_url; // and here
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
            return {
                payment: payment
            };
        } catch (err) {
            throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}

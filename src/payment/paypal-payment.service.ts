/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paypal from '@paypal/checkout-server-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class PaypalPaymentService {
  private clientId: string;
  private clientSecret: string;
  private environment: any;
  private client: any;

  constructor(
  ) {
    this.clientId = process.env.PAYPAL_SANDBOX_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET;
    this.environment = new paypal.core.SandboxEnvironment(
      this.clientId,
      this.clientSecret,
    );
    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  async createPaymentIntent(order: Order) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.headers['PayPal-Request-Id'] = uuidv4();
    request.requestBody({
      "intent": "CAPTURE",
      "client_secret": this.clientSecret,
      "payment_source": {
        "paypal": {
          "experience_context": {
            "return_url": `${process.env.SHOP_URL || 'http://localhost:3003'}/orders/${order.tracking_number}/thank-you`,
            "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
            "cancel_url": `${process.env.SHOP_URL || 'http://localhost:3003'}/orders/${order.tracking_number}/payment`,
            "user_action": "PAY_NOW",
          },
        },
      },
      "purchase_units": order.products.map(product => ({
        "amount": {
          "currency_code": "USD",
          "value": product.price.toString(),
        },
        "description": product.description,
        "reference_id": product.id.toString(),
      })),
    });

    try {
      const response = await this.client.execute(request);
      return response.result;
    } catch (error) {
      console.error(error);
    }
  }


  async verifyOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const response = await this.client.execute(request);
      return response.result;
    } catch (error) {
      console.error(error);
    }
  }
}

/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as Paypal from '@paypal/checkout-server-sdk';
import { Order } from 'src/orders/entities/order.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaypalPaymentService {
  private clientId: string;
  private clientSecret: string;
  private environment: any;
  private client: any;
  private paypal: any;
  constructor() {
    this.paypal = Paypal;
    if (process.env.NODE_ENV === "production") {
      this.clientId = process.env.PAYPAL_CLIENT_ID;
      this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      this.environment = new this.paypal.core.LiveEnvironment(
        this.clientId,
        this.clientSecret,
      );
    } else {
      this.clientId = process.env.PAYPAL_SANDBOX_CLIENT_ID;
      this.clientSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET;
      this.environment = new this.paypal.core.SandboxEnvironment(
        this.clientId,
        this.clientSecret,
      );
    }
    this.client = new this.paypal.core.PayPalHttpClient(this.environment);
  }

  async createPaymentIntent(order: Order) {
    const request = new this.paypal.orders.OrdersCreateRequest();
    request.headers['Content-Type'] = 'application/json';
    request.headers['PayPal-Request-Id'] = uuidv4();
    const body = this.getRequestBody(order);
    request.requestBody(body);
    try {
      const response = await this.client.execute(request);
      const { links, id } = response.result;
      let redirect_url = null;
      if (links && links.find(link => link.rel === 'payer-action')) {
        redirect_url = links.find(link => link.rel === 'payer-action').href;
      }
      return {
        client_secret: this.clientSecret,
        redirect_url: redirect_url,
        id: id,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async verifyOrder(orderId: string | number) {
    console.log("verifyOrder***request", orderId)
    const request = await new this.paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const response = await this.client.execute(request);
    return {
      id: response.result.id,
      status: response.result.status,
    };
  }

  private getRequestBody(order: Order) {
    const redirectUrl = process.env.SHOP_URL || 'http://localhost:3003';
    let reference_id = '';
    if (order.tracking_number || order.id) {
      reference_id = order.tracking_number ? order.tracking_number : order.id.toString();
    }
    console.log("call-paypal*****")
    return {
      intent: 'CAPTURE',
      payment_source: {
        paypal: {
          experience_context: {
            return_url: `${redirectUrl}/orders/${order.tracking_number}/thank-you`,
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            cancel_url: `${redirectUrl}/orders/${order.tracking_number}/payment`,
            user_action: 'PAY_NOW',
          },
        },
      },
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: order.total * 100
          },
          description: 'Order From Marvel',
          reference_id: reference_id,
        },
      ],
    };
  }

}

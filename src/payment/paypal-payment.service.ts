/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as Paypal from '@paypal/checkout-server-sdk';
import { Order } from 'src/orders/entities/order.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaypalPaymentService {
  private clientId: string;
  private clientSecret: string;
  private environment: Paypal.core.LiveEnvironment | Paypal.core.SandboxEnvironment;
  private client: Paypal.core.PayPalHttpClient;
  private paypal: typeof Paypal;

  constructor() {
    this.paypal = Paypal;

    this.clientId =
      // process.env.NODE_ENV === 'production'
      //   ? process.env.PAYPAL_CLIENT_ID
      //   :
        process.env.PAYPAL_SANDBOX_CLIENT_ID;

    this.clientSecret =
      // process.env.NODE_ENV === 'production'
      //   ? process.env.PAYPAL_CLIENT_SECRET
      //   :
      process.env.PAYPAL_SANDBOX_CLIENT_SECRET;

    if (!this.clientId || !this.clientSecret) {
      throw new Error('PayPal client ID and secret must be provided.');
    }

    this.environment = process.env.NODE_ENV === 'production'
      ? new this.paypal.core.LiveEnvironment(this.clientId, this.clientSecret)
      : new this.paypal.core.SandboxEnvironment(this.clientId, this.clientSecret);

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
      const redirect_url = links?.find(link => link.rel === 'payer-action')?.href || '';

      return {
        client_secret: this.clientSecret,
        redirect_url,
        id,
      };
    } catch (error) {
      throw new HttpException({
        message: 'Error creating PayPal payment intent',
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyOrder(orderId: string): Promise<{ id: string; status: string }> {
    const request = new this.paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const response = await this.client.execute(request);
      return {
        id: response.result.id,
        status: response.result.status,
      };
    } catch (error) {
      throw new HttpException({
        message: 'Error verifying PayPal order',
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getRequestBody(order: Order) {
    const redirectUrl = process.env.SHOP_URL || 'http://localhost:3003';
    const reference_id = order.tracking_number || order.id?.toString() || uuidv4();

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
            value: order.total.toFixed(2), // Ensure value is a string with 2 decimal points
          },
          description: 'Order from Marvel',
          reference_id,
        },
      ],
    };
  }
}

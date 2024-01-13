import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPaymentIntentDto } from './dto/get-payment-intent.dto';
import { PaymentIntent, PaymentIntentInfo } from './entries/payment-intent.entity';

@Injectable()
export class PaymentIntentService {
  constructor(
    @InjectRepository(PaymentIntent)
    private paymentIntentRepository: Repository<PaymentIntent>,
    @InjectRepository(PaymentIntentInfo)
    private paymentIntentInfoRepository: Repository<PaymentIntentInfo>,
  ) { }

  async getPaymentIntent(getPaymentIntentDto: GetPaymentIntentDto): Promise<PaymentIntent> {
    const { tracking_number, payment_gateway } = getPaymentIntentDto;
    const paymentIntent = await this.paymentIntentRepository.findOne({
      where: {
        tracking_number,
        payment_gateway,
      },
      relations: ['payment_intent_info'],
    });

    if (!paymentIntent) {
      throw new NotFoundException('Payment intent not found');
    }

    return paymentIntent;
  }

  async savePaymentIdIntent(razorpayData: any): Promise<any> {
    try {
      const paymentIntentInfo = await this.paymentIntentInfoRepository.findOne({ where: { order_id: razorpayData.razorpay_order_id } });

      if (paymentIntentInfo) {
        paymentIntentInfo.payment_id = razorpayData.razorpay_payment_id;
        await this.paymentIntentInfoRepository.save(paymentIntentInfo);
        return paymentIntentInfo; // Return the updated paymentIntentInfo
      } else {
        console.error('PaymentIntentInfo not found');
      }
    } catch (error) {
      console.error(error);
    }
  }


}

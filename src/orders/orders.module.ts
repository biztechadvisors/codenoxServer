/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentModule } from 'src/payment/payment.module';
import {
  DownloadInvoiceController,
  OrderExportController,
  OrderFilesController,
  OrdersController,
  OrderStatusController,
} from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderFiles } from './entities/order.entity';
import { OrderStatus } from './entities/order-status.entity'; // Import OrderStatus entity
import { User } from 'src/users/entities/user.entity';
import { OrderProductPivot, Product } from 'src/products/entities/product.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { PaymentIntent, PaymentIntentInfo } from 'src/payment-intent/entries/payment-intent.entity';
import { OrderProductPivotRepository } from 'src/products/products.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';

@Module({
  imports: [
    AuthModule,
    PaymentModule,
    TypeOrmExModule.forCustomRepository([
      OrderProductPivotRepository
    ]),
    TypeOrmModule.forFeature([Order, OrderStatus, User, Product, OrderFiles, Coupon, PaymentIntent, OrderProductPivot, PaymentIntentInfo]), // Include Order and OrderStatus here
  ],
  controllers: [
    OrdersController,
    OrderStatusController,
    OrderFilesController,
    OrderExportController,
    DownloadInvoiceController,
  ],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule { }

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
import { Order } from './entities/order.entity';
import { OrderStatus } from './entities/order-status.entity'; // Import OrderStatus entity

@Module({
  imports: [
    AuthModule,
    PaymentModule,
    TypeOrmModule.forFeature([Order, OrderStatus]), // Include Order and OrderStatus here
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
export class OrdersModule {}

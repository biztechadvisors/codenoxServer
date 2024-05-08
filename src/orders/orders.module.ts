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
  ShiprocketController,
} from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderFiles } from './entities/order.entity';
import { OrderStatus } from './entities/order-status.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderProductPivot, Product } from 'src/products/entities/product.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { PaymentIntent, PaymentIntentInfo } from 'src/payment-intent/entries/payment-intent.entity';
import { OrderProductPivotRepository } from 'src/products/products.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { ShiprocketService } from 'src/orders/shiprocket.service';
import { HttpModule } from '@nestjs/axios';
import { MailService } from 'src/mail/mail.service';
import { Shop } from 'src/shops/entities/shop.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { Dealer } from 'src/users/entities/dealer.entity';
import { UserAddress } from 'src/addresses/entities/address.entity';
import { StocksService } from 'src/stocks/stocks.service';
import { InventoryStocks, Stocks } from 'src/stocks/entities/stocks.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';

@Module({
  imports: [
    AuthModule,
    PaymentModule,
    TypeOrmExModule.forCustomRepository([
      OrderProductPivotRepository
    ]),
    TypeOrmModule.forFeature([Order, UserAddress, Dealer, OrderStatus, User, Product, OrderFiles, Coupon, PaymentIntent, OrderProductPivot, PaymentIntentInfo, Shop, Permission, Stocks, StocksSellOrd, InventoryStocks]), // Include Order and OrderStatus here
    HttpModule,
  ],
  controllers: [
    OrdersController,
    OrderStatusController,
    OrderFilesController,
    OrderExportController,
    DownloadInvoiceController,
    ShiprocketController,
  ],
  providers: [OrdersService, ShiprocketService, MailService, StocksService],
  exports: [OrdersService],
})
export class OrdersModule { }

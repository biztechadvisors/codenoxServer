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
import { File, OrderProductPivot, Product, Variation } from 'src/products/entities/product.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { PaymentIntent, PaymentIntentInfo } from 'src/payment-intent/entries/payment-intent.entity';
import { ShiprocketService } from 'src/orders/shiprocket.service';
import { HttpModule } from '@nestjs/axios';
import { MailService } from 'src/mail/mail.service';
import { Shop } from 'src/shops/entities/shop.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { Dealer } from 'src/users/entities/dealer.entity';
import { StocksService } from 'src/stocks/stocks.service';
import { InventoryStocks, Stocks } from 'src/stocks/entities/stocks.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';
import { NotificationService } from 'src/notifications/services/notifications.service';  // Import NotificationService
import { NotificationModule } from 'src/notifications/notifications.module';
import { Notification } from 'src/notifications/entities/notifications.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { UserAdd } from '../address/entities/address.entity';
import { AnalyticsService } from '../analytics/analytics.service';
import { Analytics, TotalYearSaleByMonth } from '../analytics/entities/analytics.entity';
import { Refund } from '../refunds/entities/refund.entity';
import { CacheService } from '../helpers/cacheService';

@Module({
  imports: [
    AuthModule,
    PaymentModule,
    NotificationModule,
    TypeOrmModule.forFeature([Order, OrderProductPivot, UserAdd, Dealer, OrderStatus, User, Product, OrderFiles, Coupon, PaymentIntent, OrderProductPivot, PaymentIntentInfo, Shop, Permission, Stocks, StocksSellOrd, InventoryStocks, Variation, Notification, File, Analytics, Permission, StocksSellOrd, TotalYearSaleByMonth, Refund]),
    HttpModule,
    CacheModule.register()
  ],
  controllers: [
    OrdersController,
    OrderStatusController,
    OrderFilesController,
    OrderExportController,
    DownloadInvoiceController,
    ShiprocketController,
  ],
  providers: [OrdersService, AnalyticsService, ShiprocketService, MailService, StocksService, NotificationService, CacheService],
  exports: [OrdersService],
})
export class OrdersModule { }

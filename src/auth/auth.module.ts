import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { NotificationModule } from 'src/notifications/notifications.module';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { JwtStrategy } from './auth-helper/jwt.strategy';
import { SessionService } from './auth-helper/session.service';
import { UsersModule } from '../users/users.module';
import { AnalyticsService } from '../analytics/analytics.service';
import { Analytics, TotalYearSaleByMonth } from '../analytics/entities/analytics.entity';
import { Order } from '../orders/entities/order.entity';
import { Refund } from '../refunds/entities/refund.entity';
import { StocksSellOrd } from '../stocks/entities/stocksOrd.entity';
import { Shop } from '../shops/entities/shop.entity';
import { CacheService } from '../helpers/cacheService';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Permission, Order, Analytics, Refund, StocksSellOrd,
      TotalYearSaleByMonth, Shop]),
    UsersModule,
    MailModule,
    NotificationModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '4m' },
    }),
    CacheModule.register(),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SessionService, AnalyticsService, CacheService],
  exports: [AuthService],
})
export class AuthModule { }

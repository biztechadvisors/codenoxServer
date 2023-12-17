import { Injectable } from '@nestjs/common'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { Banner, Type, TypeSettings } from 'src/types/entities/type.entity'
import { Address, UserAddress } from 'src/addresses/entities/address.entity'
import { Category } from 'src/categories/entities/category.entity'
import { Attachment } from 'src/common/entities/attachment.entity'
import { Order } from 'src/orders/entities/order.entity'
import {
  PaymentIntent,
  PaymentIntentInfo,
} from 'src/payment-intent/entries/payment-intent.entity'
import {
  OrderProductPivot,
  Product,
  Variation,
  VariationOption,
} from 'src/products/entities/product.entity'
import {
  ContactDetails,
  CurrencyOptions,
  DeliveryTime,
  EmailAdmin,
  EmailCustomer,
  EmailEvent,
  EmailVendor,
  Location,
  LogoSettings,
  PaymentGateway,
  SeoSettings,
  ServerInfo,
  Setting,
  SettingsOptions,
  ShopSocials,
  SmsAdmin,
  SmsCustomer,
  SmsEvent,
  SmsVendor,
} from 'src/settings/entities/setting.entity'
import { Balance } from 'src/shops/entities/balance.entity'
import { PaymentInfo, Shop } from 'src/shops/entities/shop.entity'
import { ShopSettings } from 'src/shops/entities/shopSettings.entity'
import { Profile, Social } from 'src/users/entities/profile.entity'
import { User } from 'src/users/entities/user.entity'
import { Tag } from 'src/tags/entities/tag.entity'
import { Review } from 'src/reviews/entities/review.entity'
import { Feedback } from 'src/feedbacks/entities/feedback.entity'
import { Report } from 'src/reviews/entities/reports.entity'
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity'
import { Attribute } from 'src/attributes/entities/attribute.entity'
import { OrderStatus } from 'src/orders/entities/order-status.entity'
import { Coupon } from 'src/coupons/entities/coupon.entity'
import {
  Conversation,
  LatestMessage,
} from 'src/conversations/entities/conversation.entity'
import { Withdraw } from 'src/withdraws/entities/withdraw.entity'
import { Wishlist } from 'src/wishlists/entities/wishlist.entity'
import { Tax } from 'src/taxes/entities/tax.entity'
import {
  Analytics,
  TotalYearSaleByMonth,
} from 'src/analytics/entities/analytics.entity'
import { Manufacturer } from 'src/manufacturers/entities/manufacturer.entity'
import { Shipping } from 'src/shippings/entities/shipping.entity'
import { MyReports } from 'src/reports/entities/report.entity'
import { Refund } from 'src/refunds/entities/refund.entity'
import { Question } from 'src/questions/entities/question.entity'
import { PaymentMethod } from 'src/payment-method/entities/payment-method.entity'
import { PaymentGateWay } from 'src/payment-method/entities/payment-gateway.entity'
import { Message } from 'src/messages/entities/message.entity'

@Injectable()
export class DatabaseOptions implements TypeOrmOptionsFactory {
  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: '103.191.208.50',
      port: 3306,
      username: 'pzqjchtu_remote',
      password: 'h!Ibz6eSn!-S',
      database: 'pzqjchtu_CodenoxxAdmin',
      //   entities: ["src/**/*.entities/*.entity.ts"],
      entities: [
        User,
        Shop,
        Attachment,
        UserAddress,
        Address,
        Order,
        Balance,
        PaymentInfo,
        PaymentIntent,
        PaymentIntentInfo,
        ShopSettings,
        ShopSocials,
        Location,
        Product,
        Category,
        Type,
        Tag,
        Variation,
        OrderProductPivot,
        Review,
        Feedback,
        Report,
        VariationOption,
        Setting,
        SettingsOptions,
        ContactDetails,
        CurrencyOptions,
        DeliveryTime,
        EmailEvent,
        EmailAdmin,
        EmailVendor,
        EmailCustomer,
        LogoSettings,
        PaymentGateway,
        SeoSettings,
        ServerInfo,
        SmsAdmin,
        SmsVendor,
        SmsCustomer,
        Type,
        Social,
        Banner,
        TypeSettings,
        AttributeValue,
        Attribute,
        OrderStatus,
        Coupon,
        SmsEvent,
        Profile,
        Conversation,
        LatestMessage,
        Withdraw,
        Wishlist,
        Tax,
        Analytics,
        TotalYearSaleByMonth,
        Manufacturer,
        Shipping,
        MyReports,
        Refund,
        Question,
        PaymentMethod,
        PaymentGateWay,
        Message,
      ],
    }
  }
}

import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Type } from "src/types/entities/type.entity";
import { Address, UserAddress } from "src/addresses/entities/address.entity";
import { Category } from "src/categories/entities/category.entity";
import { Attachment } from "src/common/entities/attachment.entity";
import { Order } from "src/orders/entities/order.entity";
import { PaymentIntent, PaymentIntentInfo } from "src/payment-intent/entries/payment-intent.entity";
import { OrderProductPivot, Product, Variation, VariationOption } from "src/products/entities/product.entity";
import { ContactDetails, CurrencyOptions, DeliveryTime, EmailAdmin, EmailCustomer, EmailEvent, EmailVendor, Location, LogoSettings, PaymentGateway, SeoSettings, ServerInfo, Setting, SettingsOptions, ShopSocials, SmsAdmin, SmsCustomer, SmsEvent, SmsVendor } from "src/settings/entities/setting.entity";
import { Balance } from "src/shops/entities/balance.entity";
import { PaymentInfo, Shop } from "src/shops/entities/shop.entity";
import { ShopSettings } from "src/shops/entities/shopSettings.entity";
import { Social } from "src/users/entities/profile.entity";
import { User } from "src/users/entities/user.entity";
import { Tag } from "src/tags/entities/tag.entity";
import { Review } from "src/reviews/entities/review.entity";
import { Feedback } from "src/feedbacks/entities/feedback.entity";
import { Report } from "src/reviews/entities/reports.entity";

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: "mysql",
    host: "103.191.208.50",
    port: 3306,
    username: "pzqjchtu_remote",
    password: "h!Ibz6eSn!-S",
    database: "pzqjchtu_CodenoxxAdmin",
    //   entities: ["src/**/*.entities/*.entity.ts"],
    entities: [User, Shop, Attachment, UserAddress, Address, Order, Balance, PaymentInfo, PaymentIntent, PaymentIntentInfo, ShopSettings, ShopSocials, Location, Product, Category, Type, Tag, Variation, OrderProductPivot, Review, Feedback, Report, VariationOption, Setting, SettingsOptions, ContactDetails, CurrencyOptions, DeliveryTime, EmailEvent, EmailAdmin, EmailVendor, EmailCustomer, LogoSettings, PaymentGateway, SeoSettings, ServerInfo, SmsEvent, SmsAdmin, SmsVendor,SmsCustomer],
    synchronize: true,
    logging: true,
};


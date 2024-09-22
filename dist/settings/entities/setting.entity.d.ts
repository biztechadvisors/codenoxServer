import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
export declare class SmsAdmin {
    id: number;
    refundOrder: boolean;
    paymentOrder: boolean;
    statusChangeOrder: boolean;
}
export declare class SeoSettings {
    id: number;
    metaTitle?: string;
    metaDescription?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: Attachment;
    twitterHandle?: string;
    twitterCardType?: string;
    metaTags?: string;
    canonicalUrl?: string;
}
export declare class GoogleSettings {
    id: number;
    isEnable: boolean;
    tagManagerId: string;
}
export declare class FacebookSettings {
    id: number;
    isEnable: boolean;
    appId: string;
    pageId: string;
}
export declare class ShopSocials {
    id: number;
    icon: string;
    url: string;
}
export declare class DeliveryTime {
    id: number;
    title: string;
    description: string;
}
export declare class LogoSettings {
    id: string;
    original: string;
    thumbnail: string;
    file_name: string;
}
export declare class SmsVendor {
    id: number;
    refundOrder: boolean;
    paymentOrder: boolean;
    statusChangeOrder: boolean;
}
export declare class SmsCustomer {
    id: number;
    refundOrder: boolean;
    paymentOrder: boolean;
    statusChangeOrder: boolean;
}
export declare class EmailAdmin {
    id: number;
    refundOrder: boolean;
    paymentOrder: boolean;
    statusChangeOrder: boolean;
}
export declare class EmailVendor {
    id: number;
    refundOrder: boolean;
    createReview: boolean;
    paymentOrder: boolean;
    createQuestion: boolean;
    statusChangeOrder: boolean;
}
export declare class EmailCustomer {
    id: number;
    refundOrder: boolean;
    paymentOrder: boolean;
    answerQuestion: boolean;
    statusChangeOrder: boolean;
}
export declare class ServerInfo {
    id: number;
    memory_limit: string;
    post_max_size: number;
    max_input_time: string;
    max_execution_time: string;
    upload_max_filesize: number;
}
export declare class PaymentGateway {
    id: number;
    name: string;
    title: string;
}
export declare class SmsEvent {
    id: number;
    admin: SmsAdmin;
    vendor: SmsVendor;
    customer: SmsCustomer;
}
export declare class EmailEvent {
    id: number;
    admin: EmailAdmin;
    vendor: EmailVendor;
    customer: EmailCustomer;
}
export declare class CurrencyOptions {
    id: number;
    formation: string;
    fractions: number;
}
export declare class Location {
    id: number;
    lat: number;
    lng: number;
    city?: string;
    state: string;
    country: string;
    zip?: string;
    formattedAddress: string;
}
export declare class ContactDetails {
    id: number;
    socials: ShopSocials[];
    contact: string;
    location: Location;
    website: string;
}
export declare class SettingsOptions extends CoreEntity {
    id: number;
    contactDetails: ContactDetails;
    currency: string;
    currencyOptions: CurrencyOptions;
    currencyToWalletRatio: number;
    defaultAi: string;
    defaultPaymentGateway: string;
    deliveryTime: DeliveryTime[];
    emailEvent: EmailEvent;
    freeShipping: boolean;
    freeShippingAmount: number;
    guestCheckout: boolean;
    isProductReview: boolean;
    logo: LogoSettings;
    maximumQuestionLimit: number;
    maxShopDistance: number;
    minimumOrderAmount: number;
    paymentGateway: PaymentGateway[];
    seo: SeoSettings;
    server_info: ServerInfo;
    shippingClass: number;
    signupPoints: number;
    siteSubtitle: string;
    siteTitle: string;
    smsEvent: SmsEvent;
    StripeCardOnly: boolean;
    taxClass: number;
    useAi: boolean;
    useCashOnDelivery: boolean;
    useEnableGateway: boolean;
    useGoogleMap: boolean;
    useMustVerifyEmail: boolean;
    useOtp: boolean;
}
export declare class Setting extends CoreEntity {
    id: number;
    shop: Shop | null;
    options: SettingsOptions;
    language: string;
    translated_languages: string[];
}

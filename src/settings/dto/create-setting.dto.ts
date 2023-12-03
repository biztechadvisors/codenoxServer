/* eslint-disable prettier/prettier */

import { AttachmentDTO } from "src/common/dto/attachment.dto";
import {  SeoSettings, } from "../entities/setting.entity";
// import { PaymentGateWay } from "src/payment-method/entities/payment-gateway.entity";

export class SmsAdminDto {
  refundOrder: boolean;
  paymentOrder: boolean;
  statusChangeOrder: boolean;
}

export class SeoSettingsDto {
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: AttachmentDTO;
  twitterHandle?: string;
  twitterCardType?: string;
  metaTags?: string;
  canonicalUrl?: string;

}

export class GoogleSettingsDto {
  isEnable: boolean;
  tagManagerId: string;
}

export class FacebookSettingsDto {
  isEnable: boolean;
  appId: string;
  pageId: string;
}

export class ShopSocials {
  icon: string;
  url: string;
}

export class DeliveryTime {
  title: string;
  description: string;
}

export class LogoSettings {
  original: string;
  thumbnail: string;
}

export class SmsVendorDto {
  refundOrder: boolean;
  paymentOrder: boolean;
  statusChangeOrder: boolean;
}

export class ContactDetails{
  id:number
  socials: ShopSocials
  contact:  string
  location: Location
  website: string
}
export class Location{
  lat: number
  lng:number
  city:string
  state:string
  country:string
  zip:string
  formattedAddress: string
}


export class CurrencyOptions{
  id: number
  formation: string
  fractions: number
}

export class EmailAdmin{
  id: number
  refundOrder: boolean
  paymentOrder: boolean
  statusChangeOrder: boolean
}

export class EmailVendor{
  id:number
  refundOrder:boolean
  createReview: boolean
  paymentOrder: boolean
  createQuestion: boolean
  statusChangeOrder: boolean
}

export class EmailCustomer{
  id:number;
  refundOrder:boolean
  paymentOrder:boolean
  answerQuestion:boolean
  statusChangeOrder:boolean
}

export class EmailEvent{
  id:number
  admin:EmailAdmin
  vendor: EmailVendor
  customer: EmailCustomer
}

export class OptionPaymentGateway{
  id: number
  name: string
  title: string
}

export class ServerInfo{
  id: number
  memory_limit: string
  post_max_size: number
  max_input_time: string
  max_execution_time: string
  upload_max_filesize: number
}


export class SmsEventDto{
  id:number
  admin:SmsAdminDto
  vendor: SmsVendorDto
  customer:SmsCustomerDto
}

export class SmsCustomerDto{
  id:number
  refundOrder: boolean
  paymentOrder:boolean
  statusChangeOrder:boolean
}

export class SettingsOptionsDto {
  contactDetails: ContactDetails;
  currency: string;
  currencyOptions: CurrencyOptions;
  currencyToWalletRatio: number;
  defaultAi: string;
  defaultPaymentGateway: string;
  deliveryTime: DeliveryTime;
  emailEvent: EmailEvent;
  freeShipping: boolean;
  freeShippingAmount: number;
  guestCheckout: boolean;
  isProductReview: boolean;
  logo: LogoSettings;
  maximumQuestionLimit: number;
  maxShopDistance: number;
  minimumOrderAmount: number;
  paymentGateway: OptionPaymentGateway;
  seo: SeoSettings;
  server_info: ServerInfo;
  shippingClass: number;
  signupPoints: number;
  siteSubtitle: string;
  siteTitle: string;
  smsEvent: SmsEventDto;
  StripeCardOnly: boolean;
  taxClass: number;
  useAi: boolean;
  useCashOnDelivery: boolean;
  useEnableGateway: boolean;
  useGoogleMap: boolean;
  useMustVerifyEmail: boolean;
  useOtp: boolean;
}

export class SettingDto {
  options: SettingsOptionsDto;
  language: string;
  translated_languages: string | string[];
}

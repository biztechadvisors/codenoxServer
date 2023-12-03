/* eslint-disable prettier/prettier */
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SmsAdmin {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  refundOrder: boolean;
  @Column()
  paymentOrder: boolean;
  @Column()
  statusChangeOrder: boolean;
}

@Entity()
export class SeoSettings {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  metaTitle?: string;
  @Column()
  metaDescription?: string;
  @Column()
  ogTitle?: string;
  @Column()
  ogDescription?: string;
  @OneToOne(() => Attachment)
  @JoinColumn()
  ogImage?: Attachment;
  @Column()
  twitterHandle?: string;
  @Column()
  twitterCardType?: string;
  @Column()
  metaTags?: string;
  @Column()
  canonicalUrl?: string;
}

@Entity()
export class GoogleSettings {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  isEnable: boolean;
  @Column()
  tagManagerId: string;
}

@Entity()
export class FacebookSettings {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  isEnable: boolean;
  @Column()
  appId: string;
  @Column()
  pageId: string;
}

@Entity()
export class ShopSocials {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  icon: string;
  @Column()
  url: string;
}

@Entity()
export class DeliveryTime {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  description: string;
}

@Entity()
export class LogoSettings {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  original: string;
  @Column()
  thumbnail: string;
}

@Entity()
export class SmsVendor {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  refundOrder: boolean;
  @Column()
  paymentOrder: boolean;
  @Column()
  statusChangeOrder: boolean;
}

@Entity()
export class SmsCustomer {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  refundOrder: boolean;
  @Column()
  paymentOrder: boolean;
  @Column()
  statusChangeOrder: boolean;
}

@Entity()
export class EmailAdmin {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  refundOrder: boolean;
  @Column()
  paymentOrder: boolean;
  @Column()
  statusChangeOrder: boolean;
}

@Entity()
export class EmailVendor {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  refundOrder: boolean;
  @Column()
  createReview: boolean;
  @Column()
  paymentOrder: boolean;
  @Column()
  createQuestion: boolean;
  @Column()
  statusChangeOrder: boolean;
}

@Entity()
export class EmailCustomer {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  refundOrder: boolean;
  @Column()
  paymentOrder: boolean;
  @Column()
  answerQuestion: boolean;
  @Column()
  statusChangeOrder: boolean;
}

@Entity()
export class ServerInfo {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  memory_limit: string;
  @Column()
  post_max_size: number;
  @Column()
  max_input_time: string;
  @Column()
  max_execution_time: string;
  @Column()
  upload_max_filesize: number;
}

@Entity()
export class PaymentGateway {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  title: string;
}

@Entity()
export class SmsEvent {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => SmsAdmin)
  admin: SmsAdmin;
  @ManyToOne(() => SmsVendor)
  vendor: SmsVendor;
  @ManyToOne(() => SmsCustomer)
  customer: SmsCustomer;
}


@Entity()
export class EmailEvent {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => EmailAdmin)
  admin: EmailAdmin;
  @ManyToOne(() => EmailVendor)
  vendor: EmailVendor;
  @ManyToOne(() => EmailCustomer)
  customer: EmailCustomer;
}

@Entity()
export class CurrencyOptions {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  formation: string;
  @Column()
  fractions: number;
}

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  lat: number;
  @Column()
  lng: number;
  @Column()
  city?: string;
  @Column()
  state: string;
  @Column()
  country: string;
  @Column()
  zip?: string;
  @Column()
  formattedAddress: string;
}

@Entity()
export class ContactDetails {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToMany(() => ShopSocials)
  @JoinTable()
  socials: ShopSocials[];
  @Column()
  contact: string;
  @ManyToOne(() => Location)
  location: Location;
  @Column()
  website: string;
}

@Entity()
export class SettingsOptions {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => ContactDetails)
  contactDetails: ContactDetails;
  @Column()
  currency: string;
  @ManyToOne(() => CurrencyOptions)
  currencyOptions: CurrencyOptions;
  @Column()
  currencyToWalletRatio: number;
  @Column()
  defaultAi: string;
  @Column()
  defaultPaymentGateway: string;
  @ManyToMany(() => DeliveryTime)
  @JoinTable()
  deliveryTime: DeliveryTime[];
  @ManyToOne(() => EmailEvent)
  emailEvent: EmailEvent;
  @Column()
  freeShipping: boolean;
  @Column({ type: 'float' })
  freeShippingAmount: number;
  @Column()
  guestCheckout: boolean;
  @Column()
  isProductReview: boolean;
  @ManyToOne(() => LogoSettings)
  logo: LogoSettings;
  @Column()
  maximumQuestionLimit: number;
  @Column()
  maxShopDistance: number;
  @Column()
  minimumOrderAmount: number;
  @ManyToMany(() => PaymentGateway)
  @JoinTable()
  paymentGateway: PaymentGateway[];
  @ManyToOne(() => SeoSettings)
  seo: SeoSettings;
  @OneToOne(() => ServerInfo)
  server_info: ServerInfo;
  @Column()
  shippingClass: number;
  @Column()
  signupPoints: number;
  @Column()
  siteSubtitle: string;
  @Column()
  siteTitle: string;
  @OneToOne(() => SmsEvent)
  smsEvent: SmsEvent;
  @Column()
  StripeCardOnly: boolean;
  @Column()
  taxClass: number;
  @Column()
  useAi: boolean;
  @Column()
  useCashOnDelivery: boolean;
  @Column()
  useEnableGateway: boolean;
  @Column()
  useGoogleMap: boolean;
  @Column()
  useMustVerifyEmail: boolean;
  @Column()
  useOtp: boolean;
}

@Entity()
export class Setting extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => SettingsOptions)
  options: SettingsOptions;
  @Column()
  language: string;
  @Column({ type: 'json' })
  translated_languages: string[];
}



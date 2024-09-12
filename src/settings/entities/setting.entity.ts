/* eslint-disable prettier/prettier */
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
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

  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ nullable: true })
  metaDescription?: string;

  @Column({ nullable: true })
  ogTitle?: string;

  @Column({ nullable: true })
  ogDescription?: string;

  @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  ogImage?: Attachment;

  @Column({ nullable: true })
  twitterHandle?: string;

  @Column({ nullable: true })
  twitterCardType?: string;

  @Column({ nullable: true })
  metaTags?: string;

  @Column({ nullable: true })
  canonicalUrl?: string;
}

@Entity()
export class GoogleSettings {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  isEnable: boolean
  @Column()
  tagManagerId: string
}

@Entity()
export class FacebookSettings {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  isEnable: boolean
  @Column()
  appId: string
  @Column()
  pageId: string
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

  @Column()
  file_name: string;
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
  id: number
  @Column()
  refundOrder: boolean
  @Column()
  paymentOrder: boolean
  @Column()
  statusChangeOrder: boolean
}

@Entity()
export class EmailVendor {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  refundOrder: boolean
  @Column()
  createReview: boolean
  @Column()
  paymentOrder: boolean
  @Column()
  createQuestion: boolean
  @Column()
  statusChangeOrder: boolean
}

@Entity()
export class EmailCustomer {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  refundOrder: boolean
  @Column()
  paymentOrder: boolean
  @Column()
  answerQuestion: boolean
  @Column()
  statusChangeOrder: boolean
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

  @Column({ nullable: true })
  city?: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  zip?: string;

  @Column()
  formattedAddress: string;
}

@Entity()
export class ContactDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => ShopSocials, { cascade: true })
  @JoinTable({ name: "contaCtdetails_shopSocils" })
  socials: ShopSocials[];

  @Column()
  contact: string;

  @ManyToOne(() => Location)
  location: Location;

  @Column()
  website: string;
}

@Entity()
export class SettingsOptions extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ContactDetails, { cascade: true })
  contactDetails: ContactDetails;

  @Column()
  currency: string;

  @ManyToOne(() => CurrencyOptions)
  currencyOptions: CurrencyOptions;

  @Column({ nullable: true })
  currencyToWalletRatio: number;

  @Column()
  defaultAi: string;

  @Column()
  defaultPaymentGateway: string;

  @ManyToMany(() => DeliveryTime, { cascade: true })
  @JoinTable({ name: "settingsOptions_deliveryTime" })
  deliveryTime: DeliveryTime[];

  @ManyToOne(() => EmailEvent)
  emailEvent: EmailEvent;

  @Column()
  freeShipping: boolean;

  @Column({ type: 'float', nullable: true })
  freeShippingAmount: number;

  @Column()
  guestCheckout: boolean;

  @Column()
  isProductReview: boolean;

  @ManyToOne(() => LogoSettings, { cascade: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  logo: LogoSettings;

  @Column()
  maximumQuestionLimit: number;

  @Column()
  maxShopDistance: number;

  @Column({ nullable: true })
  minimumOrderAmount: number;

  @ManyToMany(() => PaymentGateway)
  @JoinTable({ name: "settingsOptions_paymentGateway" })
  paymentGateway: PaymentGateway[];

  @ManyToOne(() => SeoSettings)
  seo: SeoSettings;

  @ManyToOne(() => ServerInfo)
  server_info: ServerInfo;

  @Column({ nullable: true })
  shippingClass: number;

  @Column({ nullable: true })
  signupPoints: number;

  @Column({ nullable: true })
  siteSubtitle: string;

  @Column()
  siteTitle: string;

  @ManyToOne(() => SmsEvent)
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

  @OneToOne(() => Shop, { nullable: true })
  @JoinColumn()
  shop: Shop | null;

  @ManyToOne(() => SettingsOptions)
  options: SettingsOptions;

  @Column()
  language: string;

  @Column({ type: 'json' })
  translated_languages: string[];
}
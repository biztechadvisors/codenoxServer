/* eslint-disable prettier/prettier */
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { PaymentGateWay } from './payment-gateway.entity';
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentMethod extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  @IsNotEmpty()
  @IsString()
  method_key: string;
  @Column()
  @IsOptional()
  @IsBoolean()
  default_card: boolean;
  @Column()
  payment_gateway_id?: number;
  @Column()
  fingerprint?: string;
  @Column()
  owner_name?: string;
  @Column()
  network?: string;
  @Column()
  type?: string;
  @Column()
  last4?: string;
  @Column()
  expires?: string;
  @Column()
  origin?: string;
  @Column()
  verification_check?: string;
  @ManyToOne(() => PaymentGateWay)
  payment_gateways?: PaymentGateWay;
}

/* eslint-disable prettier/prettier */
import products from 'razorpay/dist/types/products';
import { Category } from 'src/categories/entities/category.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Tax extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({ type: 'varchar', nullable: true })
  hsn_no: number;
  @Column({ type: 'varchar', nullable: true })
  sac_no: string;
  @Column('decimal', { precision: 10, scale: 2 })
  rate: number; //IGST
  @Column('decimal', { precision: 10, scale: 2 })
  cgst: number;
  @Column('decimal', { precision: 10, scale: 2 })
  sgst: number; //SGST and UTGST
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  compensation_Cess: number;
  @Column()
  gst_Name: string; //goods - service

  @ManyToOne(() => Shop, { cascade: true })
  @JoinColumn()
  shop: Shop

  @OneToMany(() => Product, (products) => products.taxes)
  products: Product[];
}
// total-year-sale-by-month.entity.ts
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { forwardRef } from '@nestjs/common';
import { Order } from 'src/orders/entities/order.entity';

@Entity()
export class TotalYearSaleByMonth extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  total: number;

  @Column()
  month: string;

  @ManyToMany(
    type => Analytics,
    analytics => analytics.totalYearSaleByMonth,
  )
  @JoinTable()
  analytics: Promise<Analytics[]>;
}

// analytics.entity.ts

@Entity()
export class Analytics extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  totalRevenue?: number;

  @Column({ type: 'int', default: 0 })
  totalRefunds: number;

  @Column()
  totalShops?: number;

  @Column()
  todaysRevenue?: number;

  @Column()
  totalOrders?: number;

  @Column()
  newCustomers?: number;

  @ManyToMany(
    type => TotalYearSaleByMonth,
    totalYearSaleByMonth => totalYearSaleByMonth.analytics,
    { eager: true },
  )
  @JoinTable()
  totalYearSaleByMonth?: Promise<TotalYearSaleByMonth[]>;
}

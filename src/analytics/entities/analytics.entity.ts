import { Column, Entity, ManyToMany, PrimaryGeneratedColumn, JoinColumn, Index, JoinTable } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';

@Entity('total_year_sale_by_month')
export class TotalYearSaleByMonth extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  month: string;

  @ManyToMany(() => Analytics, (analytics) => analytics.totalYearSaleByMonth, { onDelete: 'CASCADE', eager: false })
  analytics: Analytics[];
}

@Entity('analytics')
export class Analytics extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalRevenue?: number;

  @Column({ type: 'int', default: 0 })
  totalRefunds: number;

  @Column({ type: 'int', nullable: true })
  totalShops?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  todaysRevenue?: number;

  @Column({ type: 'int', nullable: true })
  totalOrders?: number;

  @Column({ type: 'int', nullable: true })
  newCustomers?: number;

  @ManyToMany(() => TotalYearSaleByMonth, (totalYearSaleByMonth) => totalYearSaleByMonth.analytics, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'analytics_total_year_sale_by_month' })
  totalYearSaleByMonth?: TotalYearSaleByMonth[];
}

import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TotalYearSaleByMonth {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  total?: number;
  @Column()
  month?: string;
}

@Entity()
export class Analytics extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  totalRevenue?: number;
  @Column()
  totalShops?: number;
  @Column()
  todaysRevenue?: number;
  @Column()
  totalOrders?: number;
  @Column()
  newCustomers?: number;
  @ManyToMany(() => TotalYearSaleByMonth)
  @JoinTable()
  totalYearSaleByMonth?: TotalYearSaleByMonth[];
}


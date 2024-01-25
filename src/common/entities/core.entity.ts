/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class CoreEntity {
  @CreateDateColumn()
  @Type(() => Date)
  created_at: Date;

  @UpdateDateColumn()
  @Type(() => Date)
  updated_at: Date;
}


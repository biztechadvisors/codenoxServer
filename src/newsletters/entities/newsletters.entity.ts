/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
  
  @Entity()
  export class NewsLetter extends CoreEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    email: string;
  }
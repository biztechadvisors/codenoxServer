import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ai {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  status: 'success' | 'failed';
  @Column()
  result: string;
}

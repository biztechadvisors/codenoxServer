import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ai {
  @Column()
  status: 'success' | 'failed';
  @Column()
  result: string;
}

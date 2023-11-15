import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attachment extends CoreEntity {
@PrimaryGeneratedColumn()
id: number;

@Column()
thumbnail: string;

@Column()
original: string;
  type: any;
}
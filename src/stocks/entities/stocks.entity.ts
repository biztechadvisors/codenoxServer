import { Product } from "src/products/entities/product.entity";
import { Dealer } from "src/users/entities/dealer.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Stocks {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    quantity: number

    @Column()
    inStock: boolean

    @ManyToOne(() => Product, { cascade: true })
    product?: Product;

    @ManyToOne(() => User, { cascade: true, eager: true })
    user: User;
}
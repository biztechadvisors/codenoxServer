import { Order } from "src/orders/entities/order.entity";
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
    currentOrdQuant: number

    @Column()
    ordPendQuant: number

    @Column()
    dispatchedQuantity: number

    @Column()
    status: boolean

    @Column()
    inStock: boolean

    @ManyToOne(() => Product, (product) => product.stocks)
    product?: Product;

    @ManyToOne(() => User, (user) => user.stocks, { cascade: true, eager: true })
    user: User;

    @ManyToOne(() => Order, (order) => order.stocks)
    order: Order;
}
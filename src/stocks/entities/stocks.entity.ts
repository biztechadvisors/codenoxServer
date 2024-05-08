import { Order } from "src/orders/entities/order.entity";
import { Product, Variation } from "src/products/entities/product.entity";
import { Dealer } from "src/users/entities/dealer.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

// Stocks entity definition
@Entity()
export class Stocks {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    orderedQuantity: number;

    @Column()
    ordPendQuant: number;

    @Column()
    dispatchedQuantity: number;

    @ManyToOne(() => Product, { cascade: true })
    product: Product;

    @ManyToMany(() => Variation, { cascade: true })
    @JoinTable()
    variation_options: Variation[];

    @ManyToOne(() => User, { cascade: true, eager: true })
    user: User;

    @ManyToOne(() => Order, { cascade: true })
    order: Order;
}

// InventoryStocks entity definition
@Entity()
export class InventoryStocks {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    quantity: number;

    @Column()
    status: boolean;

    @Column()
    inStock: boolean;

    @ManyToOne(() => Product, { cascade: true })
    product: Product;

    @ManyToMany(() => Variation, { cascade: true })
    @JoinTable()
    variation_options: Variation[];

    @ManyToOne(() => User, { cascade: true, eager: true })
    user: User;
}

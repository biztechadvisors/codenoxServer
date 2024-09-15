import { Order } from "src/orders/entities/order.entity";
import { Product, Variation } from "src/products/entities/product.entity";
import { Dealer } from "src/users/entities/dealer.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @Column()
    receivedQuantity: number;

    @ManyToOne(() => Product, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn() // Specify the join column
    product: Product;

    @ManyToOne(() => Variation, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn()
    variation_options: Variation;

    @ManyToOne(() => User, { eager: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
    @JoinColumn() // Specify the join column
    user: User;

    @ManyToOne(() => Order, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn() // Specify the join column
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

    @ManyToMany(() => Variation, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinTable({ name: "inventoryStocks_variation_options" })
    variation_options: Variation[];

    @ManyToOne(() => Product, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn() // Specify the join column
    product: Product;

    @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn() // Specify the join column
    user: User;
}
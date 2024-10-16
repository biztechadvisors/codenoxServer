import { CoreEntity } from "@db/src/common/entities/core.entity";
import { Shop } from "@db/src/shops/entities/shop.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DealerEnquiry extends CoreEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @ManyToOne(() => Shop)
    @JoinColumn()
    shop: Shop;

    @Column()
    phone: string;
    @Column()
    email: string;
    @Column()
    purposeofInquiry: string;
    @Column()
    location: string;
    @Column()
    businessName: string;
    @Column()
    businessType: string;
    @Column()
    Message: string;
}
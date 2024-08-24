import { Blog } from '@db/src/blog/entities/blog.entity';
import { Category, SubCategory } from '@db/src/categories/entities/category.entity';
import { Event } from '@db/src/events/entities/event.entity';
import { Product } from '@db/src/products/entities/product.entity';
import { Shop } from '@db/src/shops/entities/shop.entity';
import { Tag } from '@db/src/tags/entities/tag.entity';
import { Type } from '@db/src/types/entities/type.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';

@Entity()
export class Region {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToOne(() => Shop, (shop) => shop.regions)
    shop: Shop;

    @OneToMany(() => Product, (product) => product.region, { nullable: true })
    products: Product[];

    @OneToMany(() => Type, (type) => type.region, { nullable: true })
    types: Type[];

    @OneToMany(() => Category, (category) => category.region, { nullable: true })
    categories: Category[];

    @OneToMany(() => SubCategory, (subCategory) => subCategory.region, { nullable: true })
    subCategories: SubCategory[];

    @OneToMany(() => Tag, (tag) => tag.region, { nullable: true })
    tags: Tag[];

    @OneToMany(() => Event, (event) => event.region, { nullable: true })
    events: Event[];

    @OneToMany(() => Blog, (blog) => blog.region, { nullable: true })
    blogs: Blog[];
}

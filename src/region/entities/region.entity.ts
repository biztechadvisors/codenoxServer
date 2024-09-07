import { Blog } from '@db/src/blog/entities/blog.entity';
import { Category, SubCategory } from '@db/src/categories/entities/category.entity';
import { Event } from '@db/src/events/entities/event.entity';
import { Product } from '@db/src/products/entities/product.entity';
import { Shop } from '@db/src/shops/entities/shop.entity';
import { Tag } from '@db/src/tags/entities/tag.entity';
import { Type } from '@db/src/types/entities/type.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';

@Entity()
export class Region {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => Shop, (shop) => shop.regions, { cascade: true })
    @JoinTable({
        name: 'shop_regions',
        joinColumn: { name: 'regionId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'shopId', referencedColumnName: 'id' },
    })
    shops: Shop[];

    // 
    @ManyToMany(() => Product, (product) => product.regions)
    products: Product[];

    // 
    @ManyToMany(() => Type, (type) => type.regions)
    types: Type[];

    // 
    @ManyToMany(() => Category, (category) => category.regions)
    categories: Category[];

    // 
    @ManyToMany(() => SubCategory, (subCategory) => subCategory.regions)
    subCategories: SubCategory[];

    // 
    @ManyToMany(() => Tag, (tag) => tag.regions)
    tags: Tag[];

    @OneToMany(() => Event, (event) => event.region, { nullable: true })
    events: Event[];

    // 
    @OneToMany(() => Blog, (blog) => blog.region, { nullable: true })
    blogs: Blog[];
}
import { Blog } from '@db/src/blog/entities/blog.entity';
import { Category, SubCategory } from '@db/src/categories/entities/category.entity';
import { Event } from '@db/src/events/entities/event.entity';
import { Product } from '@db/src/products/entities/product.entity';
import { Shop } from '@db/src/shops/entities/shop.entity';
import { Tag } from '@db/src/tags/entities/tag.entity';
import { Type } from '@db/src/types/entities/type.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class Region {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToOne(() => Shop, (shop) => shop.regions)
    shop: Shop;

    @ManyToMany(() => Product, (product) => product.regions)
    @JoinTable({ name: 'product_regions' })
    products: Product[];

    @ManyToMany(() => Type, (type) => type.regions)
    @JoinTable({ name: 'types_regions' })
    types: Type[];

    @ManyToMany(() => Category, (category) => category.regions)
    @JoinTable({ name: 'categories_regions' })
    categories: Category[];

    @ManyToMany(() => SubCategory, (subCategory) => subCategory.regions)
    @JoinTable({ name: 'subCategories_regions' })
    subCategories: SubCategory[];

    @ManyToMany(() => Tag, (tag) => tag.regions)
    @JoinTable({ name: 'tags_regions' })
    tags: Tag[];

    @OneToMany(() => Event, (event) => event.region, { nullable: true })
    events: Event[];

    @OneToMany(() => Blog, (blog) => blog.region, { nullable: true })
    blogs: Blog[];
}

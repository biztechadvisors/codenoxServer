import { Blog } from '@db/src/blog/entities/blog.entity';
import { Category, SubCategory } from '@db/src/categories/entities/category.entity';
import { Event } from '@db/src/events/entities/event.entity';
import { Product } from '@db/src/products/entities/product.entity';
import { Shop } from '@db/src/shops/entities/shop.entity';
import { Tag } from '@db/src/tags/entities/tag.entity';
import { Type } from '@db/src/types/entities/type.entity';
export declare class Region {
    id: number;
    name: string;
    shops: Shop[];
    products: Product[];
    types: Type[];
    categories: Category[];
    subCategories: SubCategory[];
    tags: Tag[];
    events: Event[];
    blogs: Blog[];
}

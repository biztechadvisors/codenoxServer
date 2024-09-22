import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Product } from '../entities/product.entity';
export declare enum ProductStatus {
    PUBLISH = "publish",
    DRAFT = "draft"
}
export declare enum ProductType {
    SIMPLE = "simple",
    VARIABLE = "variable"
}
export declare class ProductPaginator extends Paginator<Product> {
    data: Product[];
}
export declare class GetProductsDto extends PaginationArgs {
    orderBy?: string;
    sortedBy?: string;
    searchJoin?: string;
    search?: string;
    filter?: string;
    date_range?: string;
    language?: string;
    with?: string;
    minPrice?: number;
    maxPrice?: number;
    dealerId?: number;
    shop_id?: number;
    shopName?: string;
    regionNames?: any;
}
export declare enum QueryProductsOrderByColumn {
    CREATED_AT = "CREATED_AT",
    NAME = "NAME",
    UPDATED_AT = "UPDATED_AT"
}

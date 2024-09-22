import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Category, SubCategory } from '../entities/category.entity';
export declare class CategoryPaginator extends Paginator<Category> {
    data: Category[];
}
export declare class GetCategoriesDto extends PaginationArgs {
    orderBy?: QueryCategoriesOrderByColumn;
    sortedBy?: SortOrder;
    search?: string;
    shopSlug?: string;
    shopId?: number;
    parent?: number | string;
    language?: string;
    region_name?: string;
}
export declare enum QueryCategoriesOrderByColumn {
    CREATED_AT = "CREATED_AT",
    NAME = "NAME",
    UPDATED_AT = "UPDATED_AT"
}
export declare class GetSubCategoriesDto {
    search?: string;
    categoryId?: number;
    shopSlug?: string;
    regionName?: string;
    limit?: string;
    page?: string;
    orderBy?: string;
    sortedBy?: string;
}
export declare class SubCategoryPaginator extends Paginator<SubCategory> {
    data: SubCategory[];
}

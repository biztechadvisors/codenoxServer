/* eslint-disable prettier/prettier */
import { SortOrder } from 'src/common/dto/generic-conditions.dto'
import { PaginationArgs } from 'src/common/dto/pagination-args.dto'
import { Paginator } from 'src/common/dto/paginator.dto'

import { Category, SubCategory } from '../entities/category.entity'

export class CategoryPaginator extends Paginator<Category> {
  data: Category[]
}

export class GetCategoriesDto extends PaginationArgs {
  orderBy?: QueryCategoriesOrderByColumn;
  sortedBy?: SortOrder;
  search?: string;
  shopSlug?: string;
  shopId?: number;
  parent?: number | string = 'null';
  language?: string;
  type?: string;
  region_name?: string; // To filter by region name
}

export enum QueryCategoriesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}

export class GetSubCategoriesDto {
  search?: string;
  categoryId?: number;
  shopSlug?: string;
  regionName?: string;  // Added regionName for filtering
  limit?: string;       // Added for pagination
  page?: string;        // Added for pagination
  orderBy?: string;     // Added for sorting
  sortedBy?: string;    // Added for sorting direction
}

export class SubCategoryPaginator extends Paginator<SubCategory> {
  data: SubCategory[]
}



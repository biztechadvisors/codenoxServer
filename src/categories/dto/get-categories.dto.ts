/* eslint-disable prettier/prettier */
import { SortOrder } from 'src/common/dto/generic-conditions.dto'
import { PaginationArgs } from 'src/common/dto/pagination-args.dto'
import { Paginator } from 'src/common/dto/paginator.dto'

import { Category } from '../entities/category.entity'

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
}


export enum QueryCategoriesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}

export class GetSubCategoriesDto {
  search?: string
  categoryId: number;
  shopSlug: string;
}
import { SortOrder } from 'src/common/dto/generic-conditions.dto'
import { PaginationArgs } from 'src/common/dto/pagination-args.dto'
import { Paginator } from 'src/common/dto/paginator.dto'

import { Category } from '../entities/category.entity'

export class CategoryPaginator extends Paginator<Category> {
  data: Category[]
}

export class GetCategoriesDto extends PaginationArgs {
<<<<<<< HEAD
  orderBy?: QueryCategoriesOrderByColumn;
  sortedBy?: SortOrder;
  search?: string;
  parent?: number | string = 'null';
  language?: string;
  typeSlug?: string;
=======
  orderBy?: QueryCategoriesOrderByColumn
  sortedBy?: SortOrder
  search?: string
  parent?: number | string = 'null'
  language?: string
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
}

export enum QueryCategoriesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}

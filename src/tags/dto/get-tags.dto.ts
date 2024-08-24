/* eslint-disable prettier/prettier */
import { SortOrder } from 'src/common/dto/generic-conditions.dto'
import { PaginationArgs } from 'src/common/dto/pagination-args.dto'
import { Paginator } from 'src/common/dto/paginator.dto'

import { Tag } from '../entities/tag.entity'

export class TagPaginator extends Paginator<Tag> {
  data: Tag[]
}

export class GetTagsDto extends PaginationArgs {
  orderBy?: QueryTagsOrderByColumn;
  sortedBy?: SortOrder;
  text?: string;
  name?: string;
  shopSlug?: string;
  hasType?: string;
  language?: string;
  search?: string;
  region_name?: string;  // Add this to filter by region name
}

export enum QueryTagsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}

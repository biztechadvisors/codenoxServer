import { SortOrder } from 'src/common/dto/generic-conditions.dto';

export class GetAttributesArgs {
  orderBy?: string;
  sortedBy?: 'ASC' | 'DESC';
  shop_id?: number;
  shopSlug?: string;
  language?: string;
  search?: any;
}


export class QueryAttributesOrderByOrderByClause {
  column: QueryAttributesOrderByColumn;
  order: SortOrder;
}

export enum QueryAttributesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}
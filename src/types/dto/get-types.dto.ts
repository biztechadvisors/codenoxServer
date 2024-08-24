/* eslint-disable prettier/prettier */
import { SortOrder } from 'src/common/dto/generic-conditions.dto'

export class GetTypesDto {
  orderBy?: QueryTypesOrderByOrderByClause[];
  text?: string;
  language?: string;
  shop_id?: number;
  shopSlug?: string; // Make shopSlug optional
  search?: string;
  region_name?: string;
}

export class QueryTypesOrderByOrderByClause {
  column: QueryTypesOrderByColumn;
  order: SortOrder;
}

export enum QueryTypesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}

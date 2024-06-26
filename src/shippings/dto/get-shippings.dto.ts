/* eslint-disable prettier/prettier */
import { SortOrder } from 'src/common/dto/generic-conditions.dto';

export class GetShippingsDto {
  text?: string;
  orderBy?: QueryShippingClassesOrderByColumn;
  sortedBy?: SortOrder;
  search?: string;
}

export enum QueryShippingClassesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  NAME = 'NAME',
  AMOUNT = 'AMOUNT',
  IS_GLOBAL = 'IS_GLOBAL',
  TYPE = 'TYPE',
}
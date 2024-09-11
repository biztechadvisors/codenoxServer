/* eslint-disable prettier/prettier */
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Product } from '../entities/product.entity';

export enum ProductStatus {
  PUBLISH = 'publish',
  DRAFT = 'draft',
}

export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
}

export class ProductPaginator extends Paginator<Product> {
  data: Product[];
}

export class GetProductsDto extends PaginationArgs {
  orderBy?: string;
  sortedBy?: string;
  searchJoin?: string;
  search?: string;
  filter?: string;
  date_range?: string;
  language?: string;
  with: string;
  minPrice: number;
  maxPrice: number;
  dealerId?: number;
  shop_id?: number;
  shopName?: string;
  regionNames?: string; // Updated to handle an array of region names
}

export enum QueryProductsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}
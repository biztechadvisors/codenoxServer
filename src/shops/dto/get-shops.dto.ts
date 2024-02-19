/* eslint-disable prettier/prettier */
import { PaginationArgs } from 'src/common/dto/pagination-args.dto'
import { Paginator } from 'src/common/dto/paginator.dto'
import { Shop } from '../entities/shop.entity'

export class ShopPaginator extends Paginator<Shop> {
  count: number;
  current_page: number;
  firstItem: number;
  lastItem: number;
  last_page: number;
  per_page: number;
  total: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string;
  prev_page_url: string;
  data: Shop[];
}

export class GetShopsDto extends PaginationArgs {
  orderBy?: string
  search?: string
  sortedBy?: string
  is_active?: boolean
}

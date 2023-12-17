import { SortOrder } from 'src/common/dto/generic-conditions.dto'
import { PaginationArgs } from 'src/common/dto/pagination-args.dto'
import { Paginator } from 'src/common/dto/paginator.dto'

<<<<<<< HEAD
import { User, UserType } from '../entities/user.entity';
=======
import { User } from '../entities/user.entity'
>>>>>>> 62c223d7ff2bbe988672e7b1af7d7826c0d3e022

export class UserPaginator extends Paginator<User> {
  data: User[]
}

export class GetUsersDto extends PaginationArgs {
<<<<<<< HEAD
  orderBy?: QueryUsersOrderByColumn;
  sortedBy?: SortOrder;
  text?: string;
  search?: string;
  type?: UserType;
=======
  orderBy?: QueryUsersOrderByColumn
  sortedBy?: SortOrder
  text?: string
  search?: string
>>>>>>> 62c223d7ff2bbe988672e7b1af7d7826c0d3e022
}

export enum QueryUsersOrderByColumn {
  NAME = 'name',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  IS_ACTIVE = 'IS_ACTIVE',
}

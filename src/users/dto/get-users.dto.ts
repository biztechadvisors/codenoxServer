<<<<<<< HEAD
/* eslint-disable prettier/prettier */
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';

import { User, UserType } from '../entities/user.entity';
=======
import { SortOrder } from 'src/common/dto/generic-conditions.dto'
import { PaginationArgs } from 'src/common/dto/pagination-args.dto'
import { Paginator } from 'src/common/dto/paginator.dto'

import { User } from '../entities/user.entity'
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

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
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
}

export enum QueryUsersOrderByColumn {
  NAME = 'name',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  IS_ACTIVE = 'IS_ACTIVE',
}

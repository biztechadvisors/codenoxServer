import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { User, UserType } from '../entities/user.entity';
export declare class UserPaginator extends Paginator<User> {
    data: User[];
}
export declare class GetUsersDto extends PaginationArgs {
    searchJoin?: 'and' | 'or';
    with?: string;
    name?: string;
    orderBy?: QueryUsersOrderByColumn;
    sortedBy?: SortOrder;
    search?: string;
    usrById?: string | number;
    type?: UserType;
    limit?: number;
    page?: number;
}
export declare enum QueryUsersOrderByColumn {
    NAME = "name",
    CREATED_AT = "created_at",
    UPDATED_AT = "updated_at",
    IS_ACTIVE = "IS_ACTIVE"
}

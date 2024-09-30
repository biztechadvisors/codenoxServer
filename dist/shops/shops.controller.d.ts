import { ShopsService } from './shops.service';
import { ApproveShopDto, CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { GetShopsDto, ShopPaginator } from './dto/get-shops.dto';
import { Shop } from './entities/shop.entity';
import { GetStaffsDto } from './dto/get-staffs.dto';
import { UserPaginator } from 'src/users/dto/get-users.dto';
import { CacheService } from '../helpers/cacheService';
export declare class ShopsController {
    private readonly shopsService;
    private readonly cacheService;
    constructor(shopsService: ShopsService, cacheService: CacheService);
    create(createShopDto: CreateShopDto): Promise<Shop>;
    getShops(query: GetShopsDto): Promise<ShopPaginator>;
    getShop(slug: string): Promise<Shop | null>;
    update(id: number, updateShopDto: UpdateShopDto): Promise<Shop>;
    remove(id: number): Promise<void>;
    approve(id: number): Promise<Shop>;
    disapprove(id: number): Promise<Shop>;
}
export declare class StaffsController {
    private readonly shopsService;
    constructor(shopsService: ShopsService);
    getStaffs(query: GetStaffsDto): Promise<UserPaginator>;
}
export declare class ApproveShopController {
    private readonly shopsService;
    constructor(shopsService: ShopsService);
    approveShop(approveShopDto: ApproveShopDto): Promise<Shop>;
}
export declare class DisapproveShopController {
    private readonly shopsService;
    constructor(shopsService: ShopsService);
    disapproveShop(id: number): Promise<Shop>;
}

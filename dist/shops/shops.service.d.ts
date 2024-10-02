import { ApproveShopDto, CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { PaymentInfo, Shop } from './entities/shop.entity';
import { GetShopsDto, ShopPaginator } from './dto/get-shops.dto';
import { GetStaffsDto } from './dto/get-staffs.dto';
import { Balance } from './entities/balance.entity';
import { Location, ShopSocials } from 'src/settings/entities/setting.entity';
import { Add, UserAdd } from 'src/address/entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { ShopSettings } from './entities/shopSettings.entity';
import { AddressesService } from 'src/address/addresses.service';
import { Permission } from 'src/permission/entities/permission.entity';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { AnalyticsService } from '../analytics/analytics.service';
export declare class ShopsService {
    private readonly analyticsService;
    private readonly addressService;
    private readonly shopRepository;
    private readonly balanceRepository;
    private readonly shopSettingsRepository;
    private readonly paymentInfoRepository;
    private readonly addressRepository;
    private readonly userAddressRepository;
    private readonly shopSocialsRepository;
    private readonly locationRepository;
    private readonly userRepository;
    private readonly attachmentRepository;
    private readonly permissionRepository;
    private readonly cacheManager;
    constructor(analyticsService: AnalyticsService, addressService: AddressesService, shopRepository: Repository<Shop>, balanceRepository: Repository<Balance>, shopSettingsRepository: Repository<ShopSettings>, paymentInfoRepository: Repository<PaymentInfo>, addressRepository: Repository<Add>, userAddressRepository: Repository<UserAdd>, shopSocialsRepository: Repository<ShopSocials>, locationRepository: Repository<Location>, userRepository: Repository<User>, attachmentRepository: Repository<Attachment>, permissionRepository: Repository<Permission>, cacheManager: Cache);
    convertToSlug(text: any): Promise<any>;
    create(createShopDto: CreateShopDto): Promise<Shop>;
    getShops({ search, limit, page }: GetShopsDto): Promise<ShopPaginator>;
    getStaffs({ shop_id, limit, page, orderBy, sortedBy, createdBy }: GetStaffsDto): Promise<any>;
    getShop(slug: string): Promise<Shop | null>;
    update(id: number, updateShopDto: UpdateShopDto): Promise<Shop>;
    changeShopStatus(id: number, status: boolean): Promise<Shop>;
    remove(id: number): Promise<void>;
    disapproveShop(id: number): Promise<Shop>;
    approveShop(approveShopDto: ApproveShopDto): Promise<Shop>;
}

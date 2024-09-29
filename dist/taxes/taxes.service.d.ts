import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax } from './entities/tax.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { CacheService } from '../helpers/cacheService';
export declare enum GST_NAME {
    GOODS = "goods",
    SERVICES = "service"
}
export declare class TaxesService {
    private readonly taxRepository;
    private readonly productRepository;
    private readonly categoryRepository;
    private readonly shopRepository;
    private readonly cacheManager;
    private readonly cacheService;
    constructor(taxRepository: Repository<Tax>, productRepository: Repository<Product>, categoryRepository: Repository<Category>, shopRepository: Repository<Shop>, cacheManager: Cache, cacheService: CacheService);
    create(createTaxDto: CreateTaxDto): Promise<Tax | "Cannot Find Data Here">;
    findAllByShopIdentifier(shopId: number, shopSlug: string): Promise<Tax[]>;
    findOne(id: number): Promise<Tax>;
    update(id: number, updateTaxDto: UpdateTaxDto): Promise<Tax | "Updated unsuccessfully">;
    remove(id: number): Promise<Tax>;
    validateGST(gstNumber: string): Promise<boolean>;
}

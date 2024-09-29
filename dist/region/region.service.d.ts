import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { Shop } from '../shops/entities/shop.entity';
import { CreateRegionDto, UpdateRegionDto } from './dto/create-region.dto';
import { CacheService } from '../helpers/cacheService';
export declare class RegionService {
    private readonly regionRepository;
    private readonly shopRepository;
    private readonly cacheService;
    constructor(regionRepository: Repository<Region>, shopRepository: Repository<Shop>, cacheService: CacheService);
    createRegion(createRegionDto: CreateRegionDto): Promise<Region>;
    findAllRegionByShop(shopSlug: string): Promise<Region[]>;
    findOne(id: number): Promise<Region>;
    update(id: number, updateRegionDto: UpdateRegionDto): Promise<Region>;
    remove(id: number): Promise<void>;
}

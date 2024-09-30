import { CreateRegionDto, UpdateRegionDto } from './dto/create-region.dto';
import { RegionService } from './region.service';
import { Region } from './entities/region.entity';
import { CacheService } from '../helpers/cacheService';
export declare class RegionController {
    private readonly regionService;
    private readonly cacheService;
    constructor(regionService: RegionService, cacheService: CacheService);
    create(createRegionDto: CreateRegionDto): Promise<Region>;
    findAllRegionByShop(shopSlug: string): Promise<Region[]>;
    findOne(id: number): Promise<Region>;
    update(id: number, updateRegionDto: UpdateRegionDto): Promise<Region>;
    remove(id: number): Promise<void>;
}

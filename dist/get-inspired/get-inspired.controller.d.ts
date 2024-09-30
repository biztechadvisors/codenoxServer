import { GetInspiredService } from './get-inspired.service';
import { CreateGetInspiredDto, UpdateGetInspiredDto } from './dto/create-get-inspired.dto';
import { GetInspired } from './entities/get-inspired.entity';
import { CacheService } from '../helpers/cacheService';
export declare class GetInspiredController {
    private readonly getInspiredService;
    private readonly cacheService;
    constructor(getInspiredService: GetInspiredService, cacheService: CacheService);
    createGetInspired(createGetInspiredDto: CreateGetInspiredDto): Promise<GetInspired>;
    getAllGetInspired(shopSlug: string, type?: string, tagIds?: string, page?: number, limit?: number): Promise<{
        data: GetInspired[];
        total: number;
        page: number;
        limit: number;
    }>;
    getGetInspiredById(id: number): Promise<GetInspired>;
    updateGetInspired(id: number, updateGetInspiredDto: UpdateGetInspiredDto): Promise<GetInspired>;
    deleteGetInspired(id: number): Promise<void>;
}

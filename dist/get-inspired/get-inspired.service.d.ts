import { Repository } from 'typeorm';
import { GetInspired } from './entities/get-inspired.entity';
import { CreateGetInspiredDto, UpdateGetInspiredDto } from './dto/create-get-inspired.dto';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { Tag } from '../tags/entities/tag.entity';
export declare class GetInspiredService {
    private readonly getInspiredRepository;
    private readonly attachmentRepository;
    private readonly shopRepository;
    private readonly tagRepository;
    private readonly cacheManager;
    constructor(getInspiredRepository: Repository<GetInspired>, attachmentRepository: Repository<Attachment>, shopRepository: Repository<Shop>, tagRepository: Repository<Tag>, cacheManager: Cache);
    createGetInspired(createGetInspiredDto: CreateGetInspiredDto): Promise<GetInspired>;
    getAllGetInspired(shopSlug: string, type?: string, tagIds?: number[], page?: number, limit?: number): Promise<{
        data: GetInspired[];
        total: number;
        page: number;
        limit: number;
    }>;
    getGetInspiredById(id: number): Promise<GetInspired>;
    updateGetInspired(id: number, updateGetInspiredDto: UpdateGetInspiredDto): Promise<GetInspired>;
    deleteGetInspired(id: number): Promise<void>;
}

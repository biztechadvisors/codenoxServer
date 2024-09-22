import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Banner, Type, TypeSettings } from './entities/type.entity';
import { GetTypesDto } from './dto/get-types.dto';
import { Attachment } from 'src/common/entities/attachment.entity';
import { UploadsService } from 'src/uploads/uploads.service';
import { Shop } from 'src/shops/entities/shop.entity';
import { Repository } from 'typeorm';
import { Tag } from 'src/tags/entities/tag.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Product } from 'src/products/entities/product.entity';
import { Cache } from 'cache-manager';
import { Region } from '../region/entities/region.entity';
export declare class TypesService {
    private readonly uploadsService;
    private readonly typeRepository;
    private readonly typeSettingsRepository;
    private readonly bannerRepository;
    private readonly attachmentRepository;
    private readonly shopRepository;
    private readonly tagRepository;
    private readonly categoryRepository;
    private readonly productRepository;
    private readonly regionRepository;
    private readonly cacheManager;
    constructor(uploadsService: UploadsService, typeRepository: Repository<Type>, typeSettingsRepository: Repository<TypeSettings>, bannerRepository: Repository<Banner>, attachmentRepository: Repository<Attachment>, shopRepository: Repository<Shop>, tagRepository: Repository<Tag>, categoryRepository: Repository<Category>, productRepository: Repository<Product>, regionRepository: Repository<Region>, cacheManager: Cache);
    convertToSlug(text: any): Promise<any>;
    findAll(query: GetTypesDto): Promise<Type[]>;
    getTypeBySlug(slug: string): Promise<Type>;
    create(data: CreateTypeDto): Promise<Type>;
    update(id: number, updateTypeDto: UpdateTypeDto): Promise<Type>;
    remove(id: number): Promise<void>;
}

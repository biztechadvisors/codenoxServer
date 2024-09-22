import { CreateTagDto } from './dto/create-tag.dto';
import { GetTagsDto } from './dto/get-tags.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { Repository } from 'typeorm';
import { Type } from 'src/types/entities/type.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { Region } from '../region/entities/region.entity';
export declare class TagsService {
    private tagRepository;
    private readonly attachmentRepository;
    private typeRepository;
    private shopRepository;
    private regionRepository;
    private readonly cacheManager;
    constructor(tagRepository: Repository<Tag>, attachmentRepository: Repository<Attachment>, typeRepository: Repository<Type>, shopRepository: Repository<Shop>, regionRepository: Repository<Region>, cacheManager: Cache);
    create(createTagDto: CreateTagDto): Promise<Tag>;
    findAll(query: GetTagsDto): Promise<any>;
    findOne(param: string, language: string): Promise<Tag>;
    update(id: number, updateTagDto: UpdateTagDto): Promise<Tag>;
    remove(id: number): Promise<void>;
}

import { AttributeResponseDto, CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { GetAttributeArgs } from './dto/get-attribute.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Repository } from 'typeorm';
import { GetAttributesArgs } from './dto/get-attributes.dto';
import { Cache } from 'cache-manager';
export declare class AttributesService {
    private attributeRepository;
    private attributeValueRepository;
    private shopRepository;
    private readonly cacheManager;
    private readonly logger;
    constructor(attributeRepository: Repository<Attribute>, attributeValueRepository: Repository<AttributeValue>, shopRepository: Repository<Shop>, cacheManager: Cache);
    convertToSlug(text: any): Promise<any>;
    getValueFromSearch(searchString: string, key: string): string | null;
    create(createAttributeDto: CreateAttributeDto): Promise<{
        message: string;
        status: boolean;
    } | Attribute>;
    findAll(params: GetAttributesArgs): Promise<{
        id: number;
        name: string;
        slug: string;
        values: {
            id: number;
            value: string;
            meta?: string;
            language?: string;
        }[];
    }[]>;
    findOne(param: GetAttributeArgs): Promise<{
        message: string;
    } | Attribute | undefined>;
    update(id: number, updateAttributeDto: UpdateAttributeDto): Promise<{
        message: string;
        status: boolean;
    } | AttributeResponseDto>;
    delete(id: number): Promise<void>;
}

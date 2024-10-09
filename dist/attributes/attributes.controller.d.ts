import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { GetAttributeArgs } from './dto/get-attribute.dto';
import { Attribute } from './entities/attribute.entity';
import { GetAttributesArgs } from './dto/get-attributes.dto';
import { CacheService } from '../helpers/cacheService';
export declare class AttributesController {
    private readonly attributesService;
    private readonly cacheService;
    constructor(attributesService: AttributesService, cacheService: CacheService);
    create(createAttributeDto: CreateAttributeDto): Promise<{
        message: string;
        status: boolean;
    } | Attribute>;
    findAll(query: GetAttributesArgs): Promise<{
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
    update(id: string, updateAttributeDto: UpdateAttributeDto): Promise<{
        message: string;
        status: boolean;
    } | import("./dto/create-attribute.dto").AttributeResponseDto>;
    delete(id: number): Promise<{
        message: string;
        status: boolean;
    }>;
}

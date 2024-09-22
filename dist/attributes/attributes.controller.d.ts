import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { GetAttributeArgs } from './dto/get-attribute.dto';
import { Attribute } from './entities/attribute.entity';
import { GetAttributesArgs } from './dto/get-attributes.dto';
export declare class AttributesController {
    private readonly attributesService;
    constructor(attributesService: AttributesService);
    create(createAttributeDto: CreateAttributeDto): Promise<Attribute | {
        message: string;
        status: boolean;
    }>;
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
    update(id: string, updateAttributeDto: UpdateAttributeDto): Promise<Attribute | {
        message: string;
        status: boolean;
    }>;
    delete(id: number): Promise<{
        message: string;
        status: boolean;
    }>;
}

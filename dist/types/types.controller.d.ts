import { TypesService } from './types.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { GetTypesDto } from './dto/get-types.dto';
import { CacheService } from '../helpers/cacheService';
export declare class TypesController {
    private readonly typesService;
    private readonly cacheService;
    constructor(typesService: TypesService, cacheService: CacheService);
    create(createTypeDto: CreateTypeDto): Promise<import("./entities/type.entity").Type>;
    findAll(query: GetTypesDto): Promise<import("./entities/type.entity").Type[]>;
    getTypeBySlug(slug: string): Promise<import("./entities/type.entity").Type>;
    update(id: string, updateTypeDto: UpdateTypeDto): Promise<import("./entities/type.entity").Type>;
    remove(id: string): Promise<void>;
}

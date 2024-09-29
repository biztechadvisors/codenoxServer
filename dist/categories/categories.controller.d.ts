import { CategoriesService } from './categories.service';
import { CreateCategoryDto, CreateSubCategoryDto } from './dto/create-category.dto';
import { GetCategoriesDto, GetSubCategoriesDto } from './dto/get-categories.dto';
import { UpdateCategoryDto, UpdateSubCategoryDto } from './dto/update-category.dto';
import { CacheService } from '../helpers/cacheService';
export declare class CategoriesController {
    private readonly categoriesService;
    private readonly cacheService;
    constructor(categoriesService: CategoriesService, cacheService: CacheService);
    create(createCategoryDto: CreateCategoryDto): Promise<import("./entities/category.entity").Category>;
    findAll(query: GetCategoriesDto): Promise<import("./dto/get-categories.dto").CategoryPaginator>;
    findOne(param: string, language: string, shopId: number): Promise<import("./entities/category.entity").Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<import("./entities/category.entity").Category>;
    remove(id: string): Promise<void>;
}
export declare class SubCategoriesController {
    private readonly categoriesService;
    private readonly cacheService;
    constructor(categoriesService: CategoriesService, cacheService: CacheService);
    create(createSubCategoryDto: CreateSubCategoryDto): Promise<import("./entities/category.entity").SubCategory>;
    findAll(query: GetSubCategoriesDto): Promise<import("./dto/get-categories.dto").SubCategoryPaginator>;
    findOne(param: string, language: string, shopSlug: string): Promise<import("./entities/category.entity").SubCategory>;
    update(id: string, updateSubCategoryDto: UpdateSubCategoryDto): Promise<import("./entities/category.entity").SubCategory>;
    remove(id: string): Promise<void>;
}

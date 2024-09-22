import { CategoriesService } from './categories.service';
import { CreateCategoryDto, CreateSubCategoryDto } from './dto/create-category.dto';
import { GetCategoriesDto, GetSubCategoriesDto } from './dto/get-categories.dto';
import { UpdateCategoryDto, UpdateSubCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<import("./entities/category.entity").Category>;
    findAll(query: GetCategoriesDto): Promise<import("./dto/get-categories.dto").CategoryPaginator>;
    findOne(param: string, language: string, shopId: number): Promise<import("./entities/category.entity").Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<import("./entities/category.entity").Category>;
    remove(id: string): Promise<void>;
}
export declare class SubCategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createSubCategoryDto: CreateSubCategoryDto): Promise<import("./entities/category.entity").SubCategory>;
    findAll(query: GetSubCategoriesDto): Promise<import("./dto/get-categories.dto").SubCategoryPaginator>;
    findOne(param: string, language: string, shopSlug: string): Promise<import("./entities/category.entity").SubCategory>;
    update(id: string, updateSubCategoryDto: UpdateSubCategoryDto): Promise<import("./entities/category.entity").SubCategory>;
    remove(id: string): Promise<void>;
}

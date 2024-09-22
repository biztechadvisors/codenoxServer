import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateQuantityDto } from './dto/update-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { Product } from './entities/product.entity';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { UploadXlService } from './uploadProductsXl';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    createProduct(createProductDto: CreateProductDto): Promise<Product | {
        message: string;
    }>;
    getProducts(query: GetProductsDto): Promise<ProductPaginator>;
    getProductBySlug(slug: string, shop_id: number, dealerId?: number): Promise<Product | undefined>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    updateQuantity(id: string, updateQuantityDto: UpdateQuantityDto): Promise<{
        message: string;
        error?: undefined;
    } | {
        error: any;
        message?: undefined;
    }>;
    remove(id: string): Promise<void>;
}
export declare class PopularProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getProducts(query: GetPopularProductsDto): Promise<Product[]>;
}
export declare class UploadProductsXl {
    private readonly uploadXlService;
    constructor(uploadXlService: UploadXlService);
    uploadProducts(file: any, shopSlug: string): Promise<{
        message: string;
    }>;
}

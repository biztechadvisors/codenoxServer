/// <reference types="node" />
import { CreateProductDto, VariationOptionDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Tax } from 'src/taxes/entities/tax.entity';
import { File, OrderProductPivot, Product, Variation, VariationOption } from './entities/product.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Type } from 'src/types/entities/type.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Category, SubCategory } from 'src/categories/entities/category.entity';
import { Dealer, DealerCategoryMargin, DealerProductMargin } from 'src/users/entities/dealer.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
export declare class UploadXlService {
    private readonly productsService;
    private readonly productRepository;
    private readonly orderProductPivotRepository;
    private readonly variationRepository;
    private readonly variationOptionRepository;
    private readonly attachmentRepository;
    private readonly tagRepository;
    private readonly typeRepository;
    private readonly shopRepository;
    private readonly categoryRepository;
    private readonly attributeValueRepository;
    private readonly fileRepository;
    private readonly dealerRepository;
    private readonly dealerProductMarginRepository;
    private readonly dealerCategoryMarginRepository;
    private readonly userRepository;
    private readonly taxRepository;
    private readonly subCategoryRepository;
    logger: any;
    connection: any;
    constructor(productsService: ProductsService, productRepository: Repository<Product>, orderProductPivotRepository: Repository<OrderProductPivot>, variationRepository: Repository<Variation>, variationOptionRepository: Repository<VariationOption>, attachmentRepository: Repository<Attachment>, tagRepository: Repository<Tag>, typeRepository: Repository<Type>, shopRepository: Repository<Shop>, categoryRepository: Repository<Category>, attributeValueRepository: Repository<AttributeValue>, fileRepository: Repository<File>, dealerRepository: Repository<Dealer>, dealerProductMarginRepository: Repository<DealerProductMargin>, dealerCategoryMarginRepository: Repository<DealerCategoryMargin>, userRepository: Repository<User>, taxRepository: Repository<Tax>, subCategoryRepository: Repository<SubCategory>);
    parseExcelToDto(fileBuffer: Buffer, shopSlug: string): Promise<any[]>;
    createMainProduct(row: any, headerRow: any, shopSlug: string, variations: any[]): Promise<any>;
    splitAttributeValues(value: string): string[];
    findAttributeValue(attributeValue: string): Promise<AttributeValue | undefined>;
    createVariation(row: any, headerRow: any): Promise<any>;
    getVariations(row: any, headerRow: any): Promise<{
        attribute_value_id: number;
    }[]>;
    parseAttributes(row: any, headerRow: any): Promise<Record<string, number[]>>;
    createVariationOptions(row: any, headerRow: any): Promise<VariationOptionDto[]>;
    uploadProductsFromExcel(fileBuffer: Buffer, shopSlug: string): Promise<void>;
    saveProducts(createProductDto: CreateProductDto): Promise<Product>;
    private validateNumber;
    remove(name: string): Promise<void>;
}

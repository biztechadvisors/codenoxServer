import * as XLSX from 'xlsx';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto, VariationDto, VariationOptionDto, FileDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Tax } from 'src/taxes/entities/tax.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { File, OrderProductPivot, Product, ProductType, Variation, VariationOption } from './entities/product.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Type } from 'src/types/entities/type.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Category, SubCategory } from 'src/categories/entities/category.entity';
import { Dealer, DealerCategoryMargin, DealerProductMargin } from 'src/users/entities/dealer.entity';
import { User } from 'src/users/entities/user.entity';
import { FileRepository, OrderProductPivotRepository, ProductRepository, VariationOptionRepository, VariationRepository } from './products.repository';
import { AttachmentRepository } from 'src/common/common.repository';
import { TagRepository } from 'src/tags/tags.repository';
import { TypeRepository } from 'src/types/types.repository';
import { CategoryRepository } from 'src/categories/categories.repository';
import { ShopRepository } from 'src/shops/shops.repository';
import { AttributeValueRepository } from 'src/attributes/attribute.repository';
import { DealerCategoryMarginRepository, DealerProductMarginRepository, DealerRepository, UserRepository } from 'src/users/users.repository';
import { DeepPartial, Repository } from 'typeorm';
import { error } from 'console';

@Injectable()
export class UploadXlService {
    logger: any;
    constructor(
        private readonly productsService: ProductsService,
        @InjectRepository(Product) private readonly productRepository: ProductRepository,
        @InjectRepository(OrderProductPivot) private readonly orderProductPivotRepository: OrderProductPivotRepository,
        @InjectRepository(Variation) private readonly variationRepository: VariationRepository,
        @InjectRepository(VariationOption) private readonly variationOptionRepository: VariationOptionRepository,
        @InjectRepository(Attachment) private readonly attachmentRepository: AttachmentRepository,
        @InjectRepository(Tag) private readonly tagRepository: TagRepository,
        @InjectRepository(Type) private readonly typeRepository: TypeRepository,
        @InjectRepository(Shop) private readonly shopRepository: ShopRepository,
        @InjectRepository(Category) private readonly categoryRepository: CategoryRepository,
        @InjectRepository(AttributeValue) private readonly attributeValueRepository: AttributeValueRepository,
        @InjectRepository(File) private readonly fileRepository: Repository<File>,
        @InjectRepository(Dealer) private readonly dealerRepository: DealerRepository,
        @InjectRepository(DealerProductMargin) private readonly dealerProductMarginRepository: DealerProductMarginRepository,
        @InjectRepository(DealerCategoryMargin) private readonly dealerCategoryMarginRepository: DealerCategoryMarginRepository,
        @InjectRepository(User) private readonly userRepository: UserRepository,
        @InjectRepository(Tax) private readonly taxRepository: Repository<Tax>,
        @InjectRepository(SubCategory) private readonly subCategoryRepository: Repository<SubCategory>,

    ) { }

    async parseExcelToDto(fileBuffer: Buffer, shopSlug: string): Promise<any[]> {
        try {
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            if (!worksheet) {
                throw new Error('Invalid worksheet data.');
            }

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                throw new Error('Invalid JSON data.');
            }

            const headerRow: any[] = jsonData[0] as any[];
            const rows: any[][] = jsonData.slice(1) as any[][];
            const products: Record<string, any> = {};

            for (const row of rows) {
                if (headerRow.length === 0 || row.length === 0) {
                    continue; // Skip empty rows
                }

                const productType = row[headerRow.indexOf('Product Type')];

                if (productType === 'child' || productType === 'Child') {
                    const parentId = row[headerRow.indexOf('Parent ID')];
                    if (!parentId || !products[parentId]) {
                        console.error(new Error(`Invalid parent ID ${parentId} for variant.`));
                        return;
                    }

                    // Initialize variations array if not already initialized
                    if (!products[parentId].variations) {
                        products[parentId].variations = [];
                    }

                    // Initialize variation_options array if not already initialized
                    if (!products[parentId].variation_options) {
                        products[parentId].variation_options = { delete: [], upsert: [] };
                    }

                    const variationOptions = await this.createVariation(row, headerRow);

                    const variations = await this.getVariations(row, headerRow);

                    const attributes = this.parseAttributes(row, headerRow)

                    products[parentId].attributes.push(attributes);
                    products[parentId].variations.push(...variations);

                    products[parentId].variation_options.upsert.push(variationOptions);

                } else if (productType === 'parent' || productType === 'Parent') {

                    const productIdIndex = headerRow.indexOf('Product ID');

                    const productId = row[productIdIndex];

                    // Collect variations for the parent
                    let parentVariations = [];

                    for (const childRow of rows) {
                        const childProductType = childRow[headerRow.indexOf('Product Type')];
                        const childParentId = childRow[headerRow.indexOf('Parent ID')];

                        if ((childProductType === 'child' || childProductType === 'Child') && childParentId === productId) {
                            const variationOptions = await this.createVariation(childRow, headerRow);
                            parentVariations.push(variationOptions);
                        }
                    }

                    const mainProduct = await this.createMainProduct(row, headerRow, shopSlug, parentVariations);

                    // Initialize variations array
                    mainProduct.variations = [];
                    mainProduct.attributes = [];

                    // Initialize variation options
                    mainProduct.variation_options = { delete: [], upsert: [] };
                    products[productId] = mainProduct;

                }
            }
            const finalProducts = Object.values(products);

            return finalProducts;
        } catch (error) {
            console.error(`Error parsing Excel file: ${error.message}`);
            throw new Error('Error parsing Excel file.');
        }
    }

    async findAttributeValue(attributeValue: string): Promise<AttributeValue | undefined> {
        return this.attributeValueRepository.findOne({ where: { value: attributeValue } });
    }

    async getOrCreateAttributeValue(attributeValue: string): Promise<AttributeValue> {
        let attrValue = await this.findAttributeValue(attributeValue);
        if (!attrValue) {
            throw new NotFoundException(`Attribute value '${attributeValue}' not found.`);
        }
        return attrValue;
    }

    async getOrCreateAttributeValues(attributeValues: string[]): Promise<AttributeValue[]> {
        const promises = attributeValues.map(attrValue => this.getOrCreateAttributeValue(attrValue));
        return Promise.all(promises);
    }
    async createMainProduct(row: any, headerRow: any, shopSlug: string, variations: any[]): Promise<any> {
        let category = [];
        let subCategories = [];
        let tags = [];

        // Fetch categories
        if (row[headerRow.indexOf('Product Category')]) {
            const categoryNames = row[headerRow.indexOf('Product Category')].split(',').map(name => name.trim());
            for (const categoryName of categoryNames) {
                const categoryRecord = await this.categoryRepository.findOne({ where: { name: categoryName } });
                if (categoryRecord) {
                    category.push(categoryRecord.id);
                } else {
                    console.warn(`Category '${categoryName}' not found in the database`);
                }
            }
        }

        // Fetch subcategories
        if (row[headerRow.indexOf('Product SubCategory')]) {
            const subCategoryNames = row[headerRow.indexOf('Product SubCategory')].split(',').map(name => name.trim());
            for (const subCategoryName of subCategoryNames) {
                const subCategoryRecord = await this.subCategoryRepository.findOne({ where: { name: subCategoryName } });
                if (subCategoryRecord) {
                    subCategories.push(subCategoryRecord.id);
                } else {
                    console.warn(`SubCategory '${subCategoryName}' not found in the database`);
                }
            }
        }

        // Fetch tags
        if (row[headerRow.indexOf('Product Tags')]) {
            const tagNames = row[headerRow.indexOf('Product Tags')].split(',').map(name => name.trim());
            for (const tagName of tagNames) {
                const tagRecord = await this.tagRepository.findOne({ where: { name: tagName } });
                if (tagRecord) {
                    tags.push(tagRecord.id);
                } else {
                    console.warn(`Tag '${tagName}' not found in the database`);
                }
            }
        }

        // Fetch type
        let type = null;
        if (row[headerRow.indexOf('Product Collection')]) {
            type = await this.typeRepository.findOne({ where: { name: row[headerRow.indexOf('Product Collection')] } });
            if (!type) {
                console.warn(`Type '${row[headerRow.indexOf('Product Collection')]}' not found in the database`);
            }
        }

        // Fetch shop
        let shop = null;
        if (shopSlug) {
            shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
            if (!shop) {
                throw new Error(`Shop with slug '${shopSlug}' not found`);
            }
        }

        // Collect all variation prices and sum the quantities
        let prices: number[] = [];
        let totalQuantity = 0;
        variations.forEach(variation => {
            if (variation.sale_price !== undefined && variation.sale_price !== null) {
                prices.push(parseFloat(variation.sale_price));
            }
            if (variation.price !== undefined && variation.price !== null) {
                prices.push(parseFloat(variation.price));
            }
            totalQuantity += parseInt(variation.quantity, 10);
        });

        // Calculate min and max prices
        const min_price = prices.length > 0 ? Math.min(...prices) : 0;
        const max_price = prices.length > 0 ? Math.max(...prices) : 0;

        // Handle undefined optional values gracefully
        const status = row[headerRow.indexOf('Product Status')] || "Published";
        const unit = row[headerRow.indexOf('Product Unit')] || 1;
        const sku = row[headerRow.indexOf('Product SKU')] || null;
        const price = parseFloat(row[headerRow.indexOf('Price')] || "0");
        const salePrice = parseFloat(row[headerRow.indexOf('Sale Price')] || "0");
        const height = row[headerRow.indexOf('Height')] || 1;
        const length = row[headerRow.indexOf('Length')] || 1;
        const width = row[headerRow.indexOf('Width')] || 1;

        return {
            name: row[headerRow.indexOf('Product Name')],
            description: row[headerRow.indexOf('Product Description')],
            product_type: "variable",
            status: status,
            quantity: totalQuantity,
            min_price: min_price,
            max_price: max_price,
            price: price,
            sale_price: salePrice,
            unit: unit,
            sku: sku,
            category: category, // Array of category IDs
            subCategories: subCategories, // Array of subcategory IDs
            type_id: type ? type.id : null, // Type ID if found
            shop_id: shop ? shop.id : null, // Shop ID
            tags: tags, // Array of tag IDs
            variations: variations,
            attributes: [],
            variation_options: {
                delete: [],
                upsert: []
            },
            height: height,
            length: length,
            width: width,
            related_products: [],
            translated_languages: []
        };
    }

    async createVariation(row: any, headerRow: any): Promise<any> {
        const options: VariationOptionDto[] = await this.createVariationOptions(row, headerRow);
        // Build the title from attribute values
        let title = '';
        let i = 1;
        while (row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined && row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined) {
            const attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)];
            if (attributeValue) {
                if (title) {
                    title += '/';
                }
                title += attributeValue;
            }
            i++;
        }

        return {
            is_digital: row[headerRow.indexOf('Is Digital')] === true,
            sku: row[headerRow.indexOf('Product SKU')],
            quantity: parseInt(row[headerRow.indexOf('Child Inventory')]),
            sale_price: parseFloat(row[headerRow.indexOf('Sale Price')]),
            price: parseFloat(row[headerRow.indexOf('Price')]),
            is_disable: row[headerRow.indexOf('Is Disable')] === true,
            title,
            options,
            id: null
        };
    }

    async getVariations(row: any, headerRow: any): Promise<{ attribute_value_id: number }[]> {
        const variations: { attribute_value_id: number }[] = [];
        let i = 1;
        while (row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined && row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined) {
            const attributeName = row[headerRow.indexOf(`Attribute ${i} Name`)];
            const attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)];
            if (attributeName && attributeValue) {
                const fetchedAttributeValue = await this.findAttributeValue(attributeValue);
                if (!fetchedAttributeValue) {
                    throw new NotFoundException(`Attribute value '${attributeValue}' not found.`);
                }
                variations.push({ attribute_value_id: fetchedAttributeValue.id });
            }
            i++;
        }
        return variations;
    }

    parseAttributes(row: any, headerRow: any): Record<string, string> {
        const attributes: Record<string, string> = {};
        for (let i = 1; row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined && row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined; i++) {
            const attributeName = row[headerRow.indexOf(`Attribute ${i} Name`)];
            const attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)];
            if (attributeName && attributeValue) {
                attributes[attributeName] = attributeValue;
            }
        }
        return attributes;
    }

    async createVariationOptions(row: any, headerRow: any): Promise<VariationOptionDto[]> {
        const variationOptions = [];
        let i = 1;
        while (row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined && row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined) {
            const attributeName = row[headerRow.indexOf(`Attribute ${i} Name`)];
            const attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)];
            if (attributeName && attributeValue) {
                const attribute = await this.attributeValueRepository.findOne({ where: { value: attributeValue } });
                if (attribute) {
                    variationOptions.push({
                        name: attributeName,
                        value: attributeValue,
                    });
                } else {
                    // Log a warning or handle the case where the attribute value is not found
                    console.warn(`Attribute value '${attributeValue}' not found.`);
                }
            }
            i++;
        }
        return variationOptions;
    }

    async uploadProductsFromExcel(fileBuffer: Buffer, shopSlug: string): Promise<void> {
        try {
            const products = await this.parseExcelToDto(fileBuffer, shopSlug);

            if (products && products.length > 0) {
                for (const product of products) {
                    this.saveProducts(product)
                }
            } else {
                this.logger.warn('No products found in Excel file.'); // Use logger here
            }
        } catch (error) {
            this.logger.error(`Error uploading products from Excel: ${error.message}`);
            throw new Error('Error uploading products from Excel.');
        }
    }

    async saveProducts(createProductDto: CreateProductDto): Promise<Product> {
        try {
            const existingProduct = await this.productRepository.findOne({
                where: [{ name: createProductDto.name }, { slug: createProductDto.slug }]
            });

            let product: Product;
            if (existingProduct) {
                // Update existing product
                product = existingProduct;
                // Update product details
                product.name = createProductDto.name;
                product.slug = createProductDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                product.description = createProductDto.description;
                product.product_type = createProductDto.product_type;
                product.status = createProductDto.status;
                product.quantity = this.validateNumber(createProductDto.quantity);
                product.max_price = this.validateNumber(createProductDto.max_price) || this.validateNumber(createProductDto.price);
                product.min_price = this.validateNumber(createProductDto.min_price) || this.validateNumber(createProductDto.sale_price);
                product.price = this.validateNumber(createProductDto.price);
                product.sale_price = this.validateNumber(createProductDto.sale_price);
                product.unit = createProductDto.unit ? createProductDto.unit : 1;
                product.height = createProductDto.height ? createProductDto.height : 1;
                product.length = createProductDto.length ? createProductDto.length : 1;
                product.width = createProductDto.width ? createProductDto.width : 1;
                product.sku = createProductDto.sku;
                product.language = createProductDto.language || 'en';
                product.translated_languages = createProductDto.translated_languages || ['en'];

                // Update tax
                if (createProductDto.taxes) {
                    const tax = await this.taxRepository.findOne({ where: { id: createProductDto.taxes.id } });
                    if (tax) {
                        product.taxes = tax;
                    }
                }

                // Update type
                if (createProductDto.type_id) {
                    const type = await this.typeRepository.findOne({ where: { id: createProductDto.type_id } });
                    if (!type) {
                        throw new NotFoundException(`Type with ID ${createProductDto.type_id} not found`);
                    }
                    product.type = type;
                    product.type_id = type.id;
                }

                // Update shop
                if (createProductDto.shop_id) {
                    const shop = await this.shopRepository.findOne({ where: { id: createProductDto.shop_id } });
                    if (!shop) {
                        throw new NotFoundException(`Shop with ID ${createProductDto.shop_id} not found`);
                    }
                    product.shop = shop;
                    product.shop_id = shop.id;
                }

                // Update categories
                if (createProductDto.category) {
                    const categories = await this.categoryRepository.findByIds(createProductDto.category);
                    product.categories = categories;
                }

                // Update subcategories
                if (createProductDto.subCategories) {
                    const subCategories = await this.subCategoryRepository.findByIds(createProductDto.subCategories);
                    product.subCategories = subCategories;
                }

                // Update tags
                if (createProductDto.tags) {
                    const tags = await this.tagRepository.findByIds(createProductDto.tags);
                    product.tags = tags;
                }

                // Delete existing variation options and variations
                await this.remove(product.name);
            } else {
                // Create new product
                product = new Product();
                // Set product details
                product.name = createProductDto.name;
                product.slug = createProductDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                product.description = createProductDto.description;
                product.product_type = createProductDto.product_type;
                product.status = createProductDto.status;
                product.quantity = this.validateNumber(createProductDto.quantity);
                product.max_price = this.validateNumber(createProductDto.max_price) || this.validateNumber(createProductDto.price);
                product.min_price = this.validateNumber(createProductDto.min_price) || this.validateNumber(createProductDto.sale_price);
                product.price = this.validateNumber(createProductDto.price);
                product.sale_price = this.validateNumber(createProductDto.sale_price);
                product.unit = createProductDto.unit ? createProductDto.unit : 1;
                product.height = createProductDto.height ? createProductDto.height : 1;
                product.length = createProductDto.length ? createProductDto.length : 1;
                product.width = createProductDto.width ? createProductDto.width : 1;
                product.sku = createProductDto.sku;
                product.language = createProductDto.language || 'en';
                product.translated_languages = createProductDto.translated_languages || ['en'];

                // Set tax
                if (createProductDto.taxes) {
                    const tax = await this.taxRepository.findOne({ where: { id: createProductDto.taxes.id } });
                    if (tax) {
                        product.taxes = tax;
                    }
                }

                // Set type
                if (createProductDto.type_id) {
                    const type = await this.typeRepository.findOne({ where: { id: createProductDto.type_id } });
                    if (!type) {
                        throw new NotFoundException(`Type with ID ${createProductDto.type_id} not found`);
                    }
                    product.type = type;
                    product.type_id = type.id;
                }

                // Set categories
                if (createProductDto.category) {
                    const categories = await this.categoryRepository.findByIds(createProductDto.category);
                    product.categories = categories;
                }

                // Set subcategories
                if (createProductDto.subCategories) {
                    const subCategories = await this.subCategoryRepository.findByIds(createProductDto.subCategories);
                    product.subCategories = subCategories;
                }

                // Set tags
                if (createProductDto.tags) {
                    const tags = await this.tagRepository.findByIds(createProductDto.tags);
                    product.tags = tags;
                }
            }

            // Set shop
            if (createProductDto.shop_id) {
                const shop = await this.shopRepository.findOne({ where: { id: createProductDto.shop_id } });
                if (!shop) {
                    throw new NotFoundException(`Shop with ID ${createProductDto.shop_id} not found`);
                }
                product.shop = shop;
                product.shop_id = shop.id;
            }

            // Set image
            if (createProductDto?.image?.id) {
                const image = await this.attachmentRepository.findOne(createProductDto.image.id);
                if (!image) {
                    throw new NotFoundException(`Image with ID ${createProductDto.image.id} not found`);
                }
                product.image = image;
            }

            // Set gallery
            if (createProductDto?.gallery?.length > 0) {
                const galleryAttachments = [];
                for (const galleryImage of createProductDto.gallery) {
                    const image = await this.attachmentRepository.findOne(galleryImage.id);
                    if (!image) {
                        throw new NotFoundException(`Gallery image with ID ${galleryImage.id} not found`);
                    }
                    galleryAttachments.push(image);
                }
                product.gallery = galleryAttachments;
            }

            if (createProductDto.variations) {
                const attributeValues: AttributeValue[] = [];
                for (const variation of createProductDto.variations) {
                    const attributeValue = await this.attributeValueRepository.findOne({ where: { id: variation.attribute_value_id } });
                    if (!attributeValue) {
                        throw new NotFoundException(`Attribute value with ID ${variation.attribute_value_id} not found`);
                    }
                    attributeValues.push(attributeValue);
                }
                product.variations = attributeValues;
            }

            await this.productRepository.save(product);

            // Handle variation options
            if (
                product.product_type === ProductType.VARIABLE &&
                createProductDto.variation_options &&
                createProductDto.variation_options.upsert
            ) {
                const variationOptions = [];
                for (const variationDto of createProductDto.variation_options.upsert) {
                    const newVariation = new Variation();
                    newVariation.title = variationDto?.title;
                    newVariation.price = this.validateNumber(variationDto?.price);
                    newVariation.sku = variationDto?.sku;
                    newVariation.is_disable = variationDto?.is_disable;
                    newVariation.sale_price = this.validateNumber(variationDto?.sale_price);
                    newVariation.quantity = this.validateNumber(variationDto?.quantity);

                    if (variationDto?.image) {
                        let image = await this.fileRepository.findOne({ where: { id: variationDto.image.id } });
                        if (!image) {
                            image = new File();
                            image.attachment_id = variationDto.image.id;
                            image.url = variationDto.image.original;
                            image.fileable_id = newVariation.id;
                            await this.fileRepository.save(image);
                        }
                        newVariation.image = image;
                    }

                    const savedVariation = await this.variationRepository.save(newVariation);

                    const variationOptionEntities = [];
                    if (variationDto && variationDto.options) {
                        for (const option of variationDto.options) {
                            const newVariationOption = new VariationOption();
                            newVariationOption.name = option.name;
                            newVariationOption.value = option.value;
                            const savedVariationOption = await this.variationOptionRepository.save(newVariationOption);
                            variationOptionEntities.push(savedVariationOption);
                        }
                    }

                    savedVariation.options = variationOptionEntities;

                    await this.variationRepository.save(savedVariation);

                    variationOptions.push(savedVariation);
                }

                product.variation_options = variationOptions;

                await this.productRepository.save(product);
            }

            if (product) {
                await this.productsService.updateShopProductsCount(product.shop_id, product.id);
            }

            return product;

        } catch (error) {
            console.log('error', error)
            throw new Error('Error saving products: ' + error.message);
        }
    }

    private validateNumber(value: any): number {
        if (isNaN(value)) {
            return 0;
        }
        return Number(value);
    }

    async remove(name: string): Promise<void> {

        const products = await this.productRepository.find({ where: { name: name }, relations: ['type', 'shop', 'image', 'categories', 'tags', 'gallery', 'related_products', 'variations', 'variation_options'] });
        for (const product of products) {
            if (!product) {
                throw new NotFoundException(`Product with Name ${name} not found`);
            }
            if (product.image) {
                const image = product.image;
                product.image = null;
                await this.productRepository.save(product);
                const file = await this.fileRepository.findOne({ where: { attachment_id: image.id } });
                if (file) {
                    await this.fileRepository.remove(file);
                }
                await this.attachmentRepository.remove(image);
            }

            // Remove gallery attachments
            const gallery = await this.attachmentRepository.findByIds(product.gallery.map(g => g.id));
            await this.attachmentRepository.remove(gallery);

            // Fetch related entities
            const variations = await Promise.all(product.variation_options.map(async v => {
                const variation = await this.variationRepository.findOne({ where: { id: v.id }, relations: ['options', 'image'] });
                if (!variation) {
                    throw new NotFoundException(`Variation with ID ${v.id} not found`);
                }
                return variation;
            }));

            await Promise.all([
                ...variations.flatMap(v => v.options ? [this.variationOptionRepository.remove(v.options)] : []),
                ...variations.map(async v => {
                    if (v.image) {
                        const image = v.image;
                        v.image = null;
                        await this.variationRepository.save(v);
                        const file = await this.fileRepository.findOne({ where: { id: image.id } });
                        if (file) {
                            file.attachment_id = null;
                            await this.fileRepository.save(file).then(async () => {
                                await this.fileRepository.remove(file);
                            });
                        }
                        const attachment = await this.attachmentRepository.findOne({ where: { id: image.attachment_id } });
                        if (attachment) {
                            await this.attachmentRepository.remove(attachment);
                        }
                    }
                }),
                this.variationRepository.remove(variations),
                this.productRepository.remove(product),
            ]);
        }
    }
}
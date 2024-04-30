import * as XLSX from 'xlsx';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto, VariationDto, VariationOptionDto, FileDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Tax } from 'src/taxes/entities/tax.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { File, OrderProductPivot, Product, Variation, VariationOption } from './entities/product.entity';
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

    async parseExcelToDto(fileBuffer: Buffer): Promise<any[]> {
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

                const productType = row[headerRow.indexOf('Type')];

                if (productType === 'variation' || productType === 'Variation') {
                    const parentId = row[headerRow.indexOf('Parent Id')];
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
                    products[parentId].variations.push(variations);

                    products[parentId].variation_options.upsert.push(variationOptions);
                } else if (productType === 'main' || productType === 'Main') {
                    const productIdIndex = headerRow.indexOf('Id');
                    const productId = row[productIdIndex];
                    const mainProduct = await this.createMainProduct(row, headerRow);
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

    async createMainProduct(row: any, headerRow: any): Promise<any> {
        let category = []
        let subCategories = []
        let tags = []

        const categoryId = await this.categoryRepository.findOne({ where: { name: row[headerRow.indexOf('Category')] } });
        const subCategoryId = await this.subCategoryRepository.findOne({ where: { name: row[headerRow.indexOf('SubCategory')] } });
        const type = await this.typeRepository.findOne({ where: { name: row[headerRow.indexOf('Group')] } });
        const shop = await this.shopRepository.findOne({ where: { name: row[headerRow.indexOf('Shop')] } });
        const tagsId = await this.tagRepository.findOne({ where: { name: row[headerRow.indexOf('Tags')] } });

        category.push(categoryId.id)
        tags.push(tagsId.id)
        subCategories.push(subCategoryId.id)

        return {
            name: row[headerRow.indexOf('Name')],
            description: row[headerRow.indexOf('Description')],
            product_type: row[headerRow.indexOf('Product Type')],
            status: row[headerRow.indexOf('Status')],
            quantity: row[headerRow.indexOf('Total Quantity')],
            min_price: row[headerRow.indexOf('Min Price')],
            max_price: row[headerRow.indexOf('Max Price')],
            price: row[headerRow.indexOf('Price')],
            sale_price: row[headerRow.indexOf('Sale Price')],
            unit: row[headerRow.indexOf('Unit')],
            sku: row[headerRow.indexOf('SKU')],
            category: category,
            subCategories: subCategories,
            type_id: type.id,
            shop_id: shop.id,
            tags: tags,
            variations: [],
            attributes: [],
            variation_options: {
                delete: [],
                upsert: []
            },
            height: row[headerRow.indexOf('Height')],
            length: row[headerRow.indexOf('Length')],
            width: row[headerRow.indexOf('Width')],
            related_products: [],
            translated_languages: []
        };
    }

    async createVariation(row: any, headerRow: any): Promise<any> {
        return {
            is_digital: row[headerRow.indexOf('Is Digital')] === 'true',
            sku: row[headerRow.indexOf('SKU')],
            quantity: parseInt(row[headerRow.indexOf('Quantity')]),
            sale_price: parseFloat(row[headerRow.indexOf('Sale Price')]),
            price: parseFloat(row[headerRow.indexOf('Price')]),
            is_disable: row[headerRow.indexOf('Is Disable')] === 'true',
            title: row[headerRow.indexOf('Title')],
            options: await this.createVariationOptions(row, headerRow),
            id: null
        };
    }

    async getVariations(row: any, headerRow: any): Promise<{ attribute_value_id: number }[]> {
        const variations: { attribute_value_id: number }[] = [];
        let i = 1;
        while (row[headerRow.indexOf(`Attribute ${i}`)] !== undefined && row[headerRow.indexOf(`Value ${i}`)] !== undefined) {
            const attributeName = row[headerRow.indexOf(`Attribute ${i}`)];
            const attributeValue = row[headerRow.indexOf(`Value ${i}`)];
            if (attributeName && attributeValue) {
                const fetchedAttributeValue = await this.attributeValueRepository.findOne({ where: { value: attributeValue } });
                if (fetchedAttributeValue) {
                    variations.push({ attribute_value_id: fetchedAttributeValue.id });
                } else {
                    throw new Error(`Attribute value with name ${attributeName} and value ${attributeValue} not found.`);
                }
            }
            i++;
        }
        return variations;
    }

    parseAttributes(row: any, headerRow: any): Record<string, string> {
        const attributes: Record<string, string> = {};
        for (let i = 1; row[headerRow.indexOf(`Attribute ${i}`)] !== undefined && row[headerRow.indexOf(`Value ${i}`)] !== undefined; i++) {
            const attributeName = row[headerRow.indexOf(`Attribute ${i}`)];
            const attributeValue = row[headerRow.indexOf(`Value ${i}`)];
            if (attributeName && attributeValue) {
                attributes[attributeName] = attributeValue;
            }
        }
        return attributes;
    }

    private async createVariationOptions(row: any, headerRow: any): Promise<VariationOptionDto[]> {
        const variationOptions: VariationOptionDto[] = [];
        let i = 1;
        while (row[headerRow.indexOf(`Attribute ${i}`)] !== undefined && row[headerRow.indexOf(`Value ${i}`)] !== undefined) {
            const attributeName = row[headerRow.indexOf(`Attribute ${i}`)];
            const attributeValue = row[headerRow.indexOf(`Value ${i}`)];
            if (attributeName && attributeValue) {
                const attribute = await this.attributeValueRepository.findOne({ where: { value: attributeValue } });
                if (attribute) {
                    const option: VariationOptionDto = {
                        id: null,
                        name: attributeName,
                        value: attributeValue,
                    };
                    variationOptions.push(option);
                } else {
                    this.logger.warn(`Attribute ${attributeName} with value ${attributeValue} not found.`);
                }
            }
            i++;
        }
        return variationOptions;
    }

    async uploadProductsFromExcel(fileBuffer: Buffer): Promise<void> {
        try {
            const products = await this.parseExcelToDto(fileBuffer);

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
                console.log('existingProduct')
                // Update existing product
                product = existingProduct;
                // Update product details
                product.name = createProductDto.name;
                product.slug = createProductDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                product.description = createProductDto.description;
                product.product_type = createProductDto.product_type;
                product.status = createProductDto.status;
                product.quantity = createProductDto.quantity;
                product.max_price = createProductDto.max_price || createProductDto.price;
                product.min_price = createProductDto.min_price || createProductDto.sale_price;
                product.price = createProductDto.max_price || createProductDto.price;
                product.sale_price = createProductDto.min_price || createProductDto.sale_price;
                product.unit = createProductDto.unit;
                product.height = createProductDto.height;
                product.length = createProductDto.length;
                product.width = createProductDto.width;
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
                const type = await this.typeRepository.findOne({ where: { id: createProductDto.type_id } });
                if (!type) {
                    throw new NotFoundException(`Type with ID ${createProductDto.type_id} not found`);
                }
                product.type = type;

                // Update shop
                const shop = await this.shopRepository.findOne({ where: { id: createProductDto.shop_id } });
                if (!shop) {
                    throw new NotFoundException(`Shop with ID ${createProductDto.shop_id} not found`);
                }
                product.shop = shop;

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
                const tags = await this.tagRepository.findByIds(createProductDto.tags);
                product.tags = tags;

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
                product.quantity = createProductDto.quantity;
                product.max_price = createProductDto.max_price || createProductDto.price;
                product.min_price = createProductDto.min_price || createProductDto.sale_price;
                product.price = createProductDto.max_price || createProductDto.price;
                product.sale_price = createProductDto.min_price || createProductDto.sale_price;
                product.unit = createProductDto.unit;
                product.height = createProductDto.height;
                product.length = createProductDto.length;
                product.width = createProductDto.width;
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
                const type = await this.typeRepository.findOne({ where: { id: createProductDto.type_id } });
                if (!type) {
                    throw new NotFoundException(`Type with ID ${createProductDto.type_id} not found`);
                }
                product.type = type;

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
                const tags = await this.tagRepository.findByIds(createProductDto.tags);
                product.tags = tags;
            }

            // Set shop
            const shop = await this.shopRepository.findOne({ where: { id: createProductDto.shop_id } });
            if (!shop) {
                throw new NotFoundException(`Shop with ID ${createProductDto.shop_id} not found`);
            }
            product.shop = shop;

            if (createProductDto.image?.length > 0 || undefined) {
                const image = await this.attachmentRepository.findOne(createProductDto.image.id);
                if (!image) {
                    throw new NotFoundException(`Image with ID ${createProductDto.image.id} not found`);
                }
                product.image = image;
            }

            if (createProductDto.gallery?.length > 0 || undefined) {
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
                const attributeValues = [];

                // Iterate over each set of variations
                for (const variationSet of createProductDto.variations) {
                    const variationAttributeValues = [];

                    // Ensure that variationSet is an array
                    if (!Array.isArray(variationSet)) {
                        throw new Error(`Expected an array for variationSet, got ${typeof variationSet}`);
                    }

                    // Iterate over each variation in the set
                    for (const variation of variationSet) {

                        const attributeValue = await this.attributeValueRepository.findOne({ where: { id: variation.attribute_value_id } });
                        if (!attributeValue) {
                            throw new NotFoundException(`Attribute value with ID ${variation.attribute_value_id} not found`);
                        }
                        variationAttributeValues.push(attributeValue);
                    }

                    // Push the attribute values for this variation set
                    attributeValues.push(variationAttributeValues);
                }

                product.variations = attributeValues;
            }

            await this.productRepository.save(product);

            if (
                product.product_type === 'variable' &&
                createProductDto.variation_options &&
                createProductDto.variation_options.upsert
            ) {
                const variationOPt = [];
                for (const variationDto of createProductDto.variation_options.upsert) {

                    const newVariation = new Variation();
                    newVariation.title = variationDto.title;
                    newVariation.price = variationDto.price;
                    newVariation.sku = variationDto.sku;
                    newVariation.is_disable = variationDto.is_disable;
                    newVariation.sale_price = variationDto.sale_price;
                    newVariation.quantity = variationDto.quantity;
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
                    const variationOptions = [];
                    for (const option of variationDto.options) {

                        const newVariationOption = new VariationOption();
                        newVariationOption.id = option.id;
                        newVariationOption.name = option.name;
                        newVariationOption.value = option.value;
                        await this.variationOptionRepository.save(newVariationOption);
                        variationOptions.push(newVariationOption);
                    }
                    newVariation.options = variationOptions;

                    await this.variationRepository.save(newVariation);

                    variationOPt.push(newVariation);
                }
                product.variation_options = variationOPt;

                await this.productRepository.save(product);
            }

            if (product) {
                await this.productsService.updateShopProductsCount(shop.id, product.id);
            }
            return product;


        }
        catch (error) {
            throw new Error('Error saving products: ' + error.message);
        }
    }

    async remove(name: string): Promise<void> {
        console.log('name***remove',)
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
/* eslint-disable prettier/prettier */
import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { UpdateProductDto, UpdateQuantityDto } from './dto/update-product.dto';
import { File, OrderProductPivot, Product, ProductType, Variation, VariationOption } from './entities/product.entity';
import { paginate } from 'src/common/pagination/paginate';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FileRepository, OrderProductPivotRepository, ProductRepository, VariationOptionRepository, VariationRepository } from './products.repository';
import { AttachmentRepository } from 'src/common/common.repository';
import { Attachment } from 'src/common/entities/attachment.entity';
import { TagRepository } from 'src/tags/tags.repository';
import { Tag } from 'src/tags/entities/tag.entity';
import { Type } from 'src/types/entities/type.entity';
import { TypeRepository } from 'src/types/types.repository';
import { Shop } from 'src/shops/entities/shop.entity';
import { ShopRepository } from 'src/shops/shops.repository';
import { CategoryRepository } from 'src/categories/categories.repository';
import { Category, SubCategory } from 'src/categories/entities/category.entity';
import { AttributeValueRepository } from 'src/attributes/attribute.repository';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Dealer, DealerCategoryMargin, DealerProductMargin } from 'src/users/entities/dealer.entity';
import { DealerCategoryMarginRepository, DealerProductMarginRepository, DealerRepository, UserRepository } from 'src/users/users.repository';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Tax } from 'src/taxes/entities/tax.entity';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';


@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product) private readonly productRepository: ProductRepository,
    @InjectRepository(OrderProductPivot) private readonly orderProductPivotRepository: OrderProductPivotRepository,
    @InjectRepository(Variation) private readonly variationRepository: VariationRepository,
    @InjectRepository(VariationOption) private readonly variationOptionRepository: VariationOptionRepository,
    @InjectRepository(Attachment) private readonly attachmentRepository: AttachmentRepository,
    @InjectRepository(Tag) private readonly tagRepository: TagRepository,
    @InjectRepository(Type) private readonly typeRepository: TypeRepository,
    @InjectRepository(Shop) private readonly shopRepository: ShopRepository,
    @InjectRepository(Category) private readonly categoryRepository: CategoryRepository,
    @InjectRepository(SubCategory) private readonly subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(AttributeValue) private readonly attributeValueRepository: AttributeValueRepository,
    @InjectRepository(File) private readonly fileRepository: FileRepository,
    @InjectRepository(Dealer) private readonly dealerRepository: DealerRepository,
    @InjectRepository(DealerProductMargin) private readonly dealerProductMarginRepository: DealerProductMarginRepository,
    @InjectRepository(DealerCategoryMargin) private readonly dealerCategoryMarginRepository: DealerCategoryMarginRepository,
    @InjectRepository(User) private readonly userRepository: UserRepository,
    @InjectRepository(Tax) private readonly taxRepository: Repository<Tax>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  // Run this method when the application starts
  async onModuleInit() {
    this.logger.debug('ProductService initialized');
    await this.updateProductStockStatus();
  }

  @Cron('0 * * * *')
  async updateProductStockStatus() {
    try {
      this.logger.debug('Updating product stock status...');

      const products = await this.productRepository.find();

      for (const product of products) {
        // Assume that 'in_stock' is a boolean property of the Product entity
        product.in_stock = product.quantity > 0;
      }

      await this.productRepository.save(products);

      this.logger.debug('Product stock status updated successfully');
    } catch (err) {
      // Handle errors appropriately
      this.logger.error('Error updating product stock status:', err.message || err);
    }
  }

  getValueFromSearch(searchString: string, key: string): string | null {
    const regex = new RegExp(`${key}:(\\d+)`);
    const match = searchString.match(regex);
    return match ? match[1] : null;
  }

  async updateShopProductsCount(shopId: number, productId: number) {
    try {
      const shop = await this.shopRepository.findOne({ where: { id: shopId } });
      if (!shop) {
        throw new NotFoundException(`Shop with ID ${shopId} not found`);
      }
      const product = await this.productRepository.findOne({ where: { id: productId } });
      if (product) {
        // Product found, increase the products_count for the shop
        shop.products_count += 1;
      } else if (shop.products_count > 0) {
        // Product not found, decrease the products_count (if it's greater than 0)
        shop.products_count -= 1;
      }
      // Save the updated shop
      await this.shopRepository.save(shop);
    } catch (err) {
      // Handle errors appropriately
      throw err;
    }
  }

  async create(createProductDto: any): Promise<Product | { message: string }> {

    const existedProduct = await this.productRepository.findOne({
      where: {
        name: createProductDto.name,
        slug: createProductDto.slug
      }
    });

    if (existedProduct) {
      return { message: "Product already exists." };
    } else {
      const product = new Product();
      product.name = createProductDto.name;
      product.slug = createProductDto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
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

      if (createProductDto?.taxes) {
        const tax = await this.taxRepository.findOne({ where: { id: createProductDto.taxes.id } });
        if (tax) {
          product.taxes = tax;
        }
      }

      const type = await this.typeRepository.findOne({ where: { id: createProductDto.type_id } });
      if (!type) {
        throw new NotFoundException(`Type with ID ${createProductDto.type_id} not found`);
      }
      product.type = type;
      product.type_id = type.id;

      const shop = await this.shopRepository.findOne({ where: { id: createProductDto.shop_id } });
      if (!shop) {
        throw new NotFoundException(`Shop with ID ${createProductDto.shop_id} not found`);
      }
      product.shop = shop;
      product.shop_id = shop.id;

      if (createProductDto.categories) {
        const categories = await this.categoryRepository.findByIds(createProductDto.categories);
        product.categories = categories;
      }

      if (createProductDto?.subCategories) {
        const subCategories = await this.subCategoryRepository.findByIds(createProductDto.subCategories);
        product.subCategories = subCategories;
      }

      const tags = await this.tagRepository.findByIds(createProductDto.tags);
      product.tags = tags;

      if (createProductDto.image?.length > 0 || undefined) {
        const image = await this.attachmentRepository.findOne(createProductDto.image.id);
        if (!image) {
          throw new NotFoundException(`Image with ID ${createProductDto.image.id} not found`);
        }
        product.image = image;
      }

      if (createProductDto?.gallery?.length > 0 || undefined) {
        const galleryAttachments = [];
        for (const galleryImage of createProductDto.gallery) {
          const image = await this.attachmentRepository.findOne({ where: { id: galleryImage.id } });
          if (!image) {
            throw new NotFoundException(`Gallery image with ID ${galleryImage.id} not found`);
          }
          galleryAttachments.push(image);
        }
        product.gallery = galleryAttachments;
      }

      if (createProductDto?.variations) {
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

      if (
        product.product_type === ProductType.VARIABLE &&
        createProductDto.variation_options &&
        createProductDto.variation_options.upsert
      ) {
        const variationOptions = [];
        for (const variationDto of createProductDto.variation_options.upsert) {
          const newVariation = new Variation();
          newVariation.title = variationDto?.title;
          newVariation.price = variationDto?.price;
          newVariation.sku = variationDto?.sku;
          newVariation.is_disable = variationDto?.is_disable;
          newVariation.sale_price = variationDto?.sale_price;
          newVariation.quantity = variationDto?.quantity;

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
          } else {
            console.log("variationDto or its options are null or undefined");
          }

          savedVariation.options = variationOptionEntities;
          await this.variationRepository.save(savedVariation);

          variationOptions.push(savedVariation);
        }

        product.variation_options = variationOptions;

        await this.productRepository.save(product);
      }

      if (product) {
        await this.updateShopProductsCount(shop.id, product.id);
      }
      return product;
    }
  }

  async getProducts(query: GetProductsDto): Promise<ProductPaginator> {
    const { limit = 20, page = 1, search, filter, dealerId, shop_id, shopName } = query;
    const startIndex = (page - 1) * limit;

    const cacheKey = `products:${shop_id || ' '}:${shopName || ' '}:${dealerId || ' '}:${filter || ' '}:${search || ' '}:${page}:${limit}`;

    this.logger.log(`Generated cache key: ${cacheKey}`);

    const cachedResult: ProductPaginator | undefined = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    } else {
      this.logger.log(`Cache miss for key: ${cacheKey}`);
    }

    const productQueryBuilder = this.productRepository.createQueryBuilder('product');

    // Perform the necessary joins
    productQueryBuilder
      .leftJoinAndSelect('product.type', 'type')
      .leftJoinAndSelect('product.shop', 'shop')
      .leftJoinAndSelect('product.image', 'image')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.subCategories', 'subCategories')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.related_products', 'related_products')
      .leftJoinAndSelect('product.variations', 'variations')
      .leftJoinAndSelect('product.variation_options', 'variation_options')
      .leftJoinAndSelect('product.gallery', 'gallery')
      .leftJoinAndSelect('product.pivot', 'pivot')
      .leftJoinAndSelect('product.orders', 'orders')
      .leftJoinAndSelect('product.my_review', 'my_review')
      .leftJoinAndSelect('product.variations', 'attributeValues')
      .leftJoinAndSelect('attributeValues.attribute', 'attribute');

    // Adding conditions dynamically
    if (shop_id) {
      productQueryBuilder.andWhere('shop.id = :shop_id', { shop_id });
    } else if (shopName) {
      productQueryBuilder.andWhere('(shop.name = :shopName OR shop.slug = :shopName)', { shopName });
    } else if (dealerId) {
      productQueryBuilder.andWhere('product.dealerId = :dealerId', { dealerId });
    }

    if (search || filter) {
      const parseSearchParams = filter ? filter.split(';') : [];
      const searchConditions = [];
      const searchParams: any = {};

      parseSearchParams.forEach(searchParam => {
        const [key, value] = searchParam.split(':');
        const searchTerm = `%${value}%`;

        switch (key) {
          case 'product':
            searchConditions.push(`(product.name LIKE :productSearchTerm OR product.slug LIKE :productSearchTerm)`);
            searchParams.productSearchTerm = searchTerm;
            break;
          case 'category':
            searchConditions.push(`(categories.name LIKE :categorySearchTerm OR categories.slug LIKE :categorySearchTerm)`);
            searchParams.categorySearchTerm = searchTerm;
            break;
          case 'subCategories':
            searchConditions.push(`(subCategories.name LIKE :subCategorySearchTerm OR subCategories.slug LIKE :subCategorySearchTerm)`);
            searchParams.subCategorySearchTerm = searchTerm;
            break;
          case 'type':
            searchConditions.push(`(type.name LIKE :typeSearchTerm OR type.slug LIKE :typeSearchTerm)`);
            searchParams.typeSearchTerm = searchTerm;
            break;
          case 'tags':
            searchConditions.push(`(tags.name LIKE :tagSearchTerm OR tags.slug LIKE :tagSearchTerm)`);
            searchParams.tagSearchTerm = searchTerm;
            break;
          case 'variations':
            const variationParams = value.split(',');
            const variationSearchTerm = variationParams.map(param => param.split('=')[1]).join('/');
            const paramName = `variation_title`;
            searchConditions.push(`(variation_options.title LIKE :${paramName})`);
            searchParams[paramName] = `%${variationSearchTerm}%`;
            break;
          default:
            break;
        }
      });

      if (search) {
        const filterTerms = search.split(' ');
        filterTerms.forEach(term => {
          const searchTerm = `%${term}%`;
          searchConditions.push(
            `(product.name LIKE :filterSearchTerm OR 
            product.sku LIKE :filterSearchTerm OR 
            categories.name LIKE :filterSearchTerm OR 
            subCategories.name LIKE :filterSearchTerm OR 
            type.name LIKE :filterSearchTerm OR 
            tags.name LIKE :filterSearchTerm OR 
            variation_options.title LIKE :filterSearchTerm)`
          );
          searchParams.filterSearchTerm = searchTerm;
        });
      }

      if (searchConditions.length > 0) {
        const combinedConditions = searchConditions.join(' AND ');

        productQueryBuilder
          .leftJoinAndSelect('product.categories', 'categories1')
          .leftJoinAndSelect('product.subCategories', 'subCategories1')
          .leftJoinAndSelect('product.type', 'type1')
          .leftJoinAndSelect('product.tags', 'tags1')
          .leftJoinAndSelect('product.variation_options', 'variation_options1')
          .where(combinedConditions, searchParams);
      }
    }

    try {
      let products: Product[] = [];
      let total: number;

      if (dealerId) {
        const dealer = await this.dealerRepository.findOne({
          where: { id: dealerId },
          relations: ['dealerProductMargins', 'dealerCategoryMargins']
        });

        if (!dealer) {
          throw new NotFoundException(`Dealer not found with id: ${dealerId}`);
        }

        const marginFind = await this.dealerProductMarginRepository.find({
          where: { dealer: { id: dealerId } },
          relations: ['product']
        });

        marginFind.forEach(margin => {
          const product = margin.product;
          product.margin = margin.margin;
          products.push(product);
        });

        const categoryMargins = await this.dealerCategoryMarginRepository.find({
          where: { dealer: { id: dealerId } },
          relations: ['category']
        });

        for (const categoryMargin of categoryMargins) {
          const foundCategory = await this.categoryRepository.findOne({
            where: { id: categoryMargin.category.id },
            relations: ['products']
          });

          if (foundCategory && foundCategory.products) {
            const categoryProducts = foundCategory.products.map(product => {
              product.margin = categoryMargin.margin;
              return product;
            });
            products.push(...categoryProducts);
          }
        }

        products = products.filter(
          (product, index, self) => index === self.findIndex(p => p.id === product.id)
        );

        total = products.length;
      } else {
        total = await productQueryBuilder.getCount();
        productQueryBuilder.skip(startIndex).take(limit);
        products = await productQueryBuilder.getMany();
      }

      const url = `/products?search=${search}&limit=${limit}&page=${page}`;
      const paginator = paginate(total, page, limit, products.length, url);

      const result = {
        data: products,
        ...paginator,
      };

      await this.cacheManager.set(cacheKey, result, 1800);
      this.logger.log(`Data cached with key: ${cacheKey}`);

      return result;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getProductBySlug(slug: string, shop_id: number, dealerId?: number): Promise<Product | undefined> {
    try {
      const cacheKey = `productBySlug:${shop_id || ' '}:${slug || ' '}:${dealerId || ' '}`;

      this.logger.log(`Generated cache key: ${cacheKey}`);

      const cachedResult: Product | undefined = await this.cacheManager.get(cacheKey);
      if (cachedResult) {
        this.logger.log(`Cache hit for key: ${cacheKey}`);
        return cachedResult;
      } else {
        this.logger.log(`Cache miss for key: ${cacheKey}`);
      }

      const shop = await this.shopRepository.findOne({ where: { id: shop_id } });
      if (!shop) {
        throw new NotFoundException(`Shop not found with id: ${shop_id}`);
      }

      // Fetch the product using the slug and shop_id
      const product = await this.productRepository.findOne({
        where: { slug: slug, shop_id: shop_id },
        relations: [
          'type',
          'shop',
          'image',
          'categories',
          'subCategories',
          'tags',
          'gallery',
          'related_products',
          'variations.attribute',
          'variation_options.options',
        ],
      });

      if (!product) {
        throw new NotFoundException(`Product not found with slug: ${slug}`);
      }

      if (dealerId) {
        const dealer = await this.dealerRepository.findOne({
          where: { id: dealerId },
          relations: ['dealerProductMargins', 'dealerCategoryMargins']
        });

        if (!dealer) {
          throw new NotFoundException(`Dealer not found with id: ${dealerId}`);
        }

        // Fetch product-specific margins
        const productMargin = await this.dealerProductMarginRepository.findOne({
          where: { dealer: { id: dealerId }, product: { id: product.id } }
        });

        if (productMargin) {
          product.margin = productMargin.margin;
        } else {
          // If no product-specific margin, fetch category-specific margins
          const categoryMargins = await this.dealerCategoryMarginRepository.find({
            where: { dealer: { id: dealerId } },
            relations: ['category']
          });

          // Find the margin for the first matching category
          for (const categoryMargin of categoryMargins) {
            if (product.categories && product.categories.some(category => category.id === categoryMargin.category.id)) {
              product.margin = categoryMargin.margin;
              break;
            }
          }
        }
      }

      // Ensure product.type is not null before accessing its properties
      if (product.type) {
        // Fetch related products using type_id
        const relatedProducts = await this.productRepository.createQueryBuilder('related_products')
          .where('related_products.type_id = :type_id', { type_id: product.type.id })
          .andWhere('related_products.id != :productId', { productId: product.id })
          .limit(20)
          .getMany();

        product.related_products = relatedProducts;
      } else {
        product.related_products = [];
      }

      await this.cacheManager.set(cacheKey, product, 1800);
      this.logger.log(`Data cached with key: ${cacheKey}`);
      // Return the product with updated margins and related products
      return product;
    } catch (error) {
      // Handle specific error types if necessary, otherwise rethrow
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('An error occurred while fetching the product.');
      }
    }
  }

  async getPopularProducts(query: GetPopularProductsDto): Promise<Product[]> {
    const { limit = 10, type_slug, search, shopName, shop_id } = query;

    const cacheKey = `popularProducts:${shop_id || ''}:${shopName || ''}:${type_slug || ''}:${limit}`;
    this.logger.log(`Generated cache key: ${cacheKey}`);

    // Check if the data is already cached
    const cachedResult: Product[] | undefined = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    } else {
      this.logger.log(`Cache miss for key: ${cacheKey}`);
    }

    // Build the query for fetching products
    const productsQueryBuilder = this.productRepository.createQueryBuilder('product');

    if (type_slug) {
      productsQueryBuilder.innerJoinAndSelect('product.type', 'type', 'type.slug = :typeSlug', { typeSlug: type_slug });
    }

    if (shop_id) {
      productsQueryBuilder.andWhere('product.shop_id = :shop_id', { shop_id });
    }

    if (shopName) {
      productsQueryBuilder.innerJoin(
        'product.shop',
        'shop',
        '(shop.name = :shopName OR shop.slug = :shopName)',
        { shopName }
      );
    }

    productsQueryBuilder
      .leftJoinAndSelect('product.image', 'image')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.related_products', 'related_products')
      .leftJoinAndSelect('product.variations', 'variations')
      .leftJoinAndSelect('product.variation_options', 'variation_options');

    const products = await productsQueryBuilder.limit(limit).getMany();

    // Cache the result for 30 minutes (1800 seconds)
    await this.cacheManager.set(cacheKey, products, 1800);
    this.logger.log(`Data cached with key: ${cacheKey}`);

    return products;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id: id }, relations: ['type', 'shop', 'categories', 'tags', 'image', 'gallery', 'variations', 'variation_options', 'pivot'] });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updatedProduct = Object.assign({}, product);
    for (const key in updateProductDto) {
      if (updateProductDto.hasOwnProperty(key) && updateProductDto[key] !== updatedProduct[key]) {
        updatedProduct[key] = updateProductDto[key];
      }
    }

    product.name = updateProductDto.name || product.name;
    product.slug = updateProductDto.name ? updateProductDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : product.slug;
    product.description = updateProductDto.description || product.description;
    product.product_type = updateProductDto.product_type || product.product_type;
    product.status = updateProductDto.status || product.status;
    product.quantity = updateProductDto.quantity || product.quantity;
    product.max_price = updateProductDto.max_price || product.max_price;
    product.min_price = updateProductDto.min_price || product.min_price;
    product.unit = updateProductDto.unit || product.unit;
    product.language = updateProductDto.language || product.language;
    product.translated_languages = updateProductDto.translated_languages || product.translated_languages;
    product.height = updateProductDto.height;
    product.length = updateProductDto.length;
    product.width = updateProductDto.width;
    product.sku = updateProductDto.sku;

    if (updateProductDto.taxes) {
      const tax = this.taxRepository.findOne({ where: { id: updateProductDto.taxes.id } })
      if (tax) {
        product.taxes = updateProductDto.taxes
      }
    }

    if (updateProductDto.type_id) {
      const type = await this.typeRepository.findOne({ where: { id: updateProductDto.type_id } });
      product.type = type;
      product.type_id = type.id;
    }
    if (updateProductDto.shop_id) {
      const shop = await this.shopRepository.findOne({ where: { id: updateProductDto.shop_id } });
      product.shop = shop;
      product.shop_id = shop.id;
    }

    if (updateProductDto.categories) {
      const categories = await this.categoryRepository.findByIds(updateProductDto.categories);
      product.categories = categories;
    }
    if (updateProductDto.tags) {
      const tags = await this.tagRepository.findByIds(updateProductDto.tags);
      product.tags = tags;
    }
    if (updateProductDto.image) {
      const existingImage = product.image ? product.image.id : null;
      const updatedImage = updateProductDto.image.id;

      // Identify image to be removed
      if (existingImage && existingImage !== updatedImage) {
        const image = product.image;
        product.image = null;
        await this.productRepository.save(product);
        await this.attachmentRepository.remove(image);
      }

      // Add new image
      if (!existingImage || existingImage !== updatedImage) {
        const image = await this.attachmentRepository.findOne({ where: { id: updatedImage } });
        product.image = image;
      }
    }

    if (updateProductDto.gallery) {
      const existingGalleryImages = product.gallery.map(galleryImage => galleryImage.id);
      const updatedGalleryImages = updateProductDto.gallery.map(galleryImage => galleryImage.id);

      // Identify images to be removed
      const imagesToRemove = existingGalleryImages.filter(id => !updatedGalleryImages.includes(id));

      // Remove images
      for (const imageId of imagesToRemove) {
        const image = product.gallery.find(galleryImage => galleryImage.id === imageId);
        product.gallery.splice(product.gallery.indexOf(image!), 1);
        await this.attachmentRepository.remove(image);
      }

      // Add new images
      const newGalleryImages = updateProductDto.gallery.filter(galleryImage => !existingGalleryImages.includes(galleryImage.id));
      for (const newGalleryImage of newGalleryImages) {
        const image = await this.attachmentRepository.findOne({ where: { id: newGalleryImage.id } });
        product.gallery.push(image);
      }
    }

    if (updateProductDto.variations) {
      // Ensure product.variations is an array
      product.variations = Array.isArray(product.variations) ? product.variations : [];
      const existingVariations = product.variations.map(variation => variation.attribute_value_id);
      // Ensure updateProductDto.variations is an array
      const updateVariations = Array.isArray(updateProductDto.variations) ? updateProductDto.variations : [];
      const newVariations = updateVariations.filter(variation => !existingVariations.includes(variation.attribute_value_id));
      for (const newVariation of newVariations) {
        const variation = await this.attributeValueRepository.findOne({ where: { id: newVariation.attribute_value_id } });
        if (variation) {
          product.variations.push(variation);
        }
      }
      // Remove the association between the Product and AttributeValue which is not in the updated product variation
      const variationsToRemove = existingVariations.filter(variation => !updateVariations.map(v => v.attribute_value_id).includes(variation));
      for (const variationId of variationsToRemove) {
        const variationIndex = product.variations.findIndex(v => v.attribute_value_id === variationId);
        if (variationIndex !== -1) {
          product.variations.splice(variationIndex, 1);
        }
      }
    }

    await this.productRepository.save(product);
    if (updateProductDto.product_type === 'variable' && updateProductDto.variation_options) {
      const existingVariations = product.variation_options.map(variation => variation.id);
      const upsertVariations = Array.isArray(updateProductDto.variation_options.upsert) ? updateProductDto.variation_options.upsert : [];
      for (const upsertVariationDto of upsertVariations) {
        let variation;
        if (existingVariations.includes(upsertVariationDto.id)) {
          variation = product.variation_options.find(variation => variation.id === upsertVariationDto.id);
        } else {
          variation = new Variation();
          product.variation_options.push(variation);
        }
        variation.title = upsertVariationDto.title;
        variation.price = upsertVariationDto.price;
        variation.sku = upsertVariationDto.sku;
        variation.is_disable = upsertVariationDto.is_disable;
        variation.sale_price = upsertVariationDto.sale_price;
        variation.quantity = upsertVariationDto.quantity;
        if (upsertVariationDto.image) {
          let image = await this.fileRepository.findOne({ where: { id: upsertVariationDto.image.id } });
          if (!image) {
            image = new File();
            image.attachment_id = upsertVariationDto.image.id;
            image.url = upsertVariationDto.image.original;
            image.fileable_id = variation.id;
            await this.fileRepository.save(image);
          }
          variation.image = image;
        }
        // Ensure variation.options is an array
        variation.options = Array.isArray(variation.options) ? variation.options : [];
        const existingOptionIds = variation.options.map(option => option.id);
        const updatedOptionIds = upsertVariationDto.options.map(option => option.id);
        const optionsToRemove = existingOptionIds.filter(id => !updatedOptionIds.includes(id));
        for (const optionId of optionsToRemove) {
          const option = variation.options.find(option => option.id === optionId);
          if (option) {
            variation.options.splice(variation.options.indexOf(option), 1);
            await this.variationOptionRepository.remove(option);
          }
        }
        const newOptions = upsertVariationDto.options.filter(option => !existingOptionIds.includes(option.id));
        for (const newOptionDto of newOptions) {
          const newOption = new VariationOption();
          newOption.id = newOptionDto.id;
          newOption.name = newOptionDto.name;
          newOption.value = newOptionDto.value;
          await this.variationOptionRepository.save(newOption);
          variation.options.push(newOption);
        }
        await this.variationRepository.save(variation);
      }
      if (updateProductDto.variation_options.delete) {
        for (const deleteId of updateProductDto.variation_options.delete) {
          const variation = await this.variationRepository.findOne({ where: { id: deleteId }, relations: ['options', 'image'] });
          if (!variation) {
            throw new NotFoundException(`Variation with ID ${deleteId} not found`);
          }

          await Promise.all([
            ...variation.options ? [this.variationOptionRepository.remove(variation.options)] : [],
            (async () => {
              if (variation.image) {
                const image = variation.image;
                variation.image = null;
                await this.variationRepository.save(variation);
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
            })(),
            this.variationRepository.remove(variation),
          ]);

          product.variation_options.splice(product.variation_options.indexOf(variation), 1);

          // Remove the association between the Product and AttributeValue
          const attributeValueIndex = product.variations.findIndex(v => v.attribute_value_id === variation.id);
          if (attributeValueIndex !== -1) {
            product.variations.splice(attributeValueIndex);
          }
        }
      }
    }

    await this.productRepository.save(product);
    // throw error
    return product;
  }

  async remove(id: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: id },
      relations: [
        'type',
        'shop',
        'image',
        'categories',
        'tags',
        'gallery',
        'related_products',
        'variations',
        'variation_options',
        'subCategories'  // Make sure to include subCategories relation
      ]
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Remove associations with tags
    product.tags = [];

    // Remove association with type
    product.type = null;

    // Remove associations with orders
    product.related_products = [];

    // Remove associations with related products
    product.orders = [];

    // Save the changes to update the associations in the database
    await this.productRepository.save(product);

    // Remove associations with categories
    if (product.categories) {
      await Promise.all(product.categories.map(async (category) => {
        if (category.products) {
          category.products = category.products.filter(p => p.id !== product.id);
          await this.categoryRepository.save(category);
        }
      }));
    }

    // Find related records in the dealer_product_margin table
    const relatedRecords = await this.dealerProductMarginRepository.find({
      where: { product: { id: product.id } }
    });

    // Delete related records
    await Promise.all(relatedRecords.map(async (record) => {
      await this.dealerProductMarginRepository.delete(record.id);
    }));

    // Remove associations with subcategories
    if (product.subCategories) {
      await Promise.all(product.subCategories.map(async (subCategory) => {
        if (subCategory.products) {
          subCategory.products = subCategory.products.filter(p => p.id !== product.id);
          await this.subCategoryRepository.save(subCategory);
        }
      }));
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
    if (product.gallery && product.gallery.length > 0) {
      const gallery = await this.attachmentRepository.findByIds(product.gallery.map(g => g.id));
      await this.attachmentRepository.remove(gallery);
    }

    // Fetch related entities
    const variations = await Promise.all(product.variation_options.map(async (v) => {
      const variation = await this.variationRepository.findOne({ where: { id: v.id }, relations: ['options', 'image'] });
      if (!variation) {
        throw new NotFoundException(`Variation with ID ${v.id} not found`);
      }
      return variation;
    }));

    await Promise.all([
      ...variations.flatMap(v => v.options ? [this.variationOptionRepository.remove(v.options)] : []),
      ...variations.map(async (v) => {
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


  async updateQuantity(id: number, updateQuantityDto: UpdateQuantityDto): Promise<void> {
    try {
      // Update only the quantity field
      await this.productRepository.update(id, { quantity: updateQuantityDto.quantity });
    } catch (err) {
      // Handle errors appropriately
      throw err;
    }
  }

}
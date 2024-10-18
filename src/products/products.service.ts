/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto'
import { UpdateProductDto, UpdateQuantityDto } from './dto/update-product.dto'
import {
  OrderProductPivot,
  Product,
  ProductType,
  Variation,
  VariationOption,
} from './entities/product.entity'
import { paginate } from 'src/common/pagination/paginate'
import { GetPopularProductsDto } from './dto/get-popular-products.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Attachment } from 'src/common/entities/attachment.entity'
import { Tag } from 'src/tags/entities/tag.entity'
import { Type } from 'src/types/entities/type.entity'
import { Shop } from 'src/shops/entities/shop.entity'
import { Category, SubCategory } from 'src/categories/entities/category.entity'
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity'
import {
  Dealer,
  DealerCategoryMargin,
  DealerProductMargin,
} from 'src/users/entities/dealer.entity'
import { User } from 'src/users/entities/user.entity'
import { In, Repository } from 'typeorm'
import { Tax } from 'src/taxes/entities/tax.entity'
import { Cron } from '@nestjs/schedule'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { CreateProductDto } from './dto/create-product.dto'
import { Region } from '../region/entities/region.entity'
import { CacheService } from '../helpers/cacheService'
import { convertToSlug } from '../helpers'

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name)

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderProductPivot)
    private readonly orderProductPivotRepository: Repository<OrderProductPivot>,
    @InjectRepository(Variation)
    private readonly variationRepository: Repository<Variation>,
    @InjectRepository(VariationOption)
    private readonly variationOptionRepository: Repository<VariationOption>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Type) private readonly typeRepository: Repository<Type>,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
    @InjectRepository(Dealer)
    private readonly dealerRepository: Repository<Dealer>,
    @InjectRepository(DealerProductMargin)
    private readonly dealerProductMarginRepository: Repository<DealerProductMargin>,
    @InjectRepository(DealerCategoryMargin)
    private readonly dealerCategoryMarginRepository: Repository<DealerCategoryMargin>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Tax) private readonly taxRepository: Repository<Tax>,
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  // Run this method when the application starts
  async onModuleInit() {
    this.logger.debug('ProductService initialized')
    await this.updateProductStockStatus()
  }

  @Cron('0 * * * *')
  async updateProductStockStatus() {
    try {
      this.logger.debug('Updating product stock status...');
      await this.productRepository.query(`
      UPDATE product
      SET in_stock = CASE
        WHEN quantity > 0 THEN true
        ELSE false
      END
    `);
      this.logger.debug('Product stock status updated successfully');
    } catch (err) {
      this.logger.error(
        'Error updating product stock status:',
        err.message || err,
      )
    }
  }

  getValueFromSearch(searchString: string, key: string): string | null {
    const regex = new RegExp(`${key}:(\\d+)`)
    const match = searchString.match(regex)
    return match ? match[1] : null
  }

  async updateShopProductsCount(shopId: number, productId: number) {
    try {

      const shop = await this.shopRepository.findOne({ where: { id: shopId } });

      if (!shop) {
        throw new NotFoundException(`Shop with ID ${shopId} not found`);
      }

      const productExists = await this.productRepository.findOne({ where: { id: productId } });

      shop.products_count = productExists ? shop.products_count + 1 : Math.max(0, shop.products_count - 1);

      await this.shopRepository.save(shop);

    } catch (err) {
      this.logger.error('Error updating shop products count:', err.message || err);
      throw new BadRequestException('Error updating shop products count');
    }
  }

  async create(
    createProductDto: CreateProductDto,
  ): Promise<Product | { message: string }> {
    const {
      name,
      slug,
      description,
      product_type,
      status,
      quantity,
      max_price,
      min_price,
      price,
      sale_price,
      unit,
      height,
      length,
      width,
      sku,
      language = 'en',
      translated_languages = ['en'],
      taxes,
      type_id,
      shop_id,
      categories,
      subCategories,
      tags,
      image,
      gallery,
      variations,
      variation_options,
      regionName, // Extract regionName
    } = createProductDto

    // Check for existing product
    const existedProduct = await this.productRepository.findOne({
      where: { name, slug },
    })
    if (existedProduct) {
      return { message: 'Product already exists.' }
    }

    // Create new product instance
    const product = this.productRepository.create({
      name,
      slug: convertToSlug(name),
      description,
      product_type,
      status,
      quantity,
      max_price: max_price || price,
      min_price: min_price || sale_price,
      price: max_price || price,
      sale_price: min_price || sale_price,
      unit,
      height,
      length,
      width,
      sku,
      language,
      translated_languages,
    })

    // Handle taxes
    if (taxes) {
      const tax = await this.taxRepository.findOne({ where: { id: taxes.id } })
      if (tax) {
        product.taxes = tax
      } else {
        throw new NotFoundException(`Tax with ID ${taxes.id} not found`)
      }
    }

    // Handle type
    if (type_id) {
      const type = await this.typeRepository.findOne({ where: { id: type_id } })
      if (!type) {
        throw new NotFoundException(`Type with ID ${type_id} not found`)
      }
      product.type = type
      product.type_id = type.id
    }

    // Handle shop
    const shop = await this.shopRepository.findOne({ where: { id: shop_id } })
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shop_id} not found`)
    }
    product.shop = shop
    product.shop_id = shop.id

    // Handle categories and subCategories
    const categoryEntities = categories
      ? await this.categoryRepository.findByIds(categories)
      : []
    const subCategoryEntities = subCategories
      ? await this.subCategoryRepository.findByIds(subCategories)
      : []

    product.categories = categoryEntities
    product.subCategories = subCategoryEntities

    // Handle tags
    product.tags = await this.tagRepository.findByIds(tags || [])

    // Handle image
    if (image) {
      const imageEntity = await this.attachmentRepository.findOne({
        where: { id: image.id },
      })
      if (!imageEntity) {
        throw new NotFoundException(`Image with ID ${image.id} not found`)
      }
      product.image = imageEntity
    }

    // Handle gallery
    if (gallery) {
      const galleryEntities = await Promise.all(
        gallery.map(async (galleryImage) => {
          const imageEntity = await this.attachmentRepository.findOne({
            where: { id: galleryImage.id },
          })
          if (!imageEntity) {
            throw new NotFoundException(
              `Gallery image with ID ${galleryImage.id} not found`,
            )
          }
          return imageEntity
        }),
      )
      product.gallery = galleryEntities
    }

    // Handle variations
    if (variations) {
      product.variations = await Promise.all(
        variations.map(async (variation) => {
          const attributeValue = await this.attributeValueRepository.findOne({
            where: { id: variation.attribute_value_id },
          })
          if (!attributeValue) {
            throw new NotFoundException(
              `Attribute value with ID ${variation.attribute_value_id} not found`,
            )
          }
          return attributeValue
        }),
      )
    }

    // Handle variation options
    if (
      product.product_type === ProductType.VARIABLE &&
      variation_options?.upsert
    ) {
      const variationOptions = await Promise.all(
        variation_options.upsert.map(async (variationDto) => {
          // Create and save the variation
          const newVariation = this.variationRepository.create({
            title: variationDto.title,
            name: variationDto.name,
            slug: convertToSlug(variationDto.name),
            price: variationDto.price,
            sku: variationDto.sku,
            is_disable: variationDto.is_disable,
            sale_price: variationDto.sale_price,
            quantity: variationDto.quantity,
          })
          const savedVariation = await this.variationRepository.save(
            newVariation,
          )

          // Handle image association
          if (variationDto?.image) {
            let image = await this.attachmentRepository.findOne({
              where: { id: variationDto.image.id },
            })

            if (!image) {
              // Create and save new image if not found
              image = this.attachmentRepository.create({
                original: variationDto.image.original,
                thumbnail: variationDto.image.thumbnail,
              })
              await this.attachmentRepository.save(image)
            }

            // Associate the image with the variation
            savedVariation.image = [image]
          }

          // Handle variation options
          const variationOptionEntities = await Promise.all(
            (variationDto.options || []).map(async (option) => {
              const values = option.value.split(',')
              return Promise.all(
                values.map(async (value) => {
                  const newVariationOption =
                    this.variationOptionRepository.create({
                      name: option.name,
                      value: value.trim(),
                    })
                  return this.variationOptionRepository.save(newVariationOption)
                }),
              )
            }),
          )

          // Flatten the array of variation options and assign them to the variation
          savedVariation.options = ([] as VariationOption[]).concat(
            ...variationOptionEntities,
          )
          await this.variationRepository.save(savedVariation)

          return savedVariation
        }),
      )

      // Associate the variations with the product
      product.variation_options = variationOptions as Variation[]
    }

    // Handle regions
    if (regionName) {
      const regions = await this.regionRepository.find({
        where: { name: In(regionName) },
      })

      // Check if all requested regions were found
      if (regions.length !== regionName.length) {
        const missingRegionNames = regionName.filter(
          (name) => !regions.some((region) => region.name === name),
        )
        throw new NotFoundException(
          `Regions with names '${missingRegionNames.join(', ')}' not found`,
        )
      }
      product.regions = regions
    }

    // Save the product
    await this.productRepository.save(product)

    // Update shop products count if necessary
    await this.updateShopProductsCount(shop.id, product.id)

    return product
  }

  async getProducts(query: GetProductsDto): Promise<ProductPaginator> {
    const {
      limit = 20,
      page = 1,
      search,
      filter,
      dealerId,
      shop_id,
      shopName,
      regionNames,
      minPrice,
      maxPrice,
    } = query;

    const startIndex = (page - 1) * limit;

    // Early return if no shop_id, shopName, or dealerId
    if (!shop_id && !shopName && !dealerId) {
      return {
        data: [],
        count: 0,
        current_page: 1,
        firstItem: null,
        lastItem: null,
        last_page: 1,
        per_page: 10,
        total: 0,
        first_page_url: '',
        last_page_url: '',
        next_page_url: '',
        prev_page_url: '',
      };
    }

    const regionsArray: string[] = Array.isArray(regionNames)
      ? regionNames
      : typeof regionNames === 'string' && regionNames.length > 0
        ? regionNames.split(',')
        : [];

    // Generate cache key for performance optimization
    const cacheKey = `products:${shop_id || ' '}:${shopName || ' '}:${dealerId || ' '
      }:${filter || ' '}:${search || ' '}:${regionsArray.join(',')}:${page}:${limit}`;

    const cachedResult: ProductPaginator | undefined =
      await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    }

    // Query builder initialization
    const productQueryBuilder = this.productRepository
      .createQueryBuilder('product')
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
      .leftJoinAndSelect('product.my_review', 'my_review')
      .leftJoinAndSelect('product.regions', 'regions');

    // Filters for shop, dealer, and region
    if (shop_id) {
      productQueryBuilder.andWhere('shop.id = :shop_id', { shop_id });
    } else if (shopName) {
      productQueryBuilder.andWhere(
        '(shop.name = :shopName OR shop.slug = :shopName)',
        { shopName },
      );
    } else if (dealerId) {
      productQueryBuilder.andWhere('product.dealerId = :dealerId', { dealerId });
    }

    if (regionsArray.length > 0) {
      productQueryBuilder.andWhere('regions.name IN (:...regionsArray)', {
        regionsArray,
      });
    }

    // Price filter
    if (minPrice !== undefined) {
      productQueryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      productQueryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Search and filter conditions
    if (search || filter) {
      const searchConditions: string[] = [];
      const searchParams: Record<string, any> = {};

      // Ensure 'filter' is a string before using it
      if (filter && typeof filter === 'string') {
        const parseSearchParams = filter.split(';');
        parseSearchParams.forEach((searchParam) => {
          const [key, value] = searchParam.split(':');
          const searchTerm = `%${value}%`;
          switch (key) {
            case 'product':
              searchConditions.push(
                '(product.name LIKE :productSearchTerm OR product.slug LIKE :productSearchTerm)',
              );
              searchParams.productSearchTerm = searchTerm;
              break;
            case 'category':
              searchConditions.push(
                '(categories.name LIKE :categorySearchTerm OR categories.slug LIKE :categorySearchTerm)',
              );
              searchParams.categorySearchTerm = searchTerm;
              break;
            case 'subCategories':
              searchConditions.push(
                '(subCategories.name LIKE :subCategorySearchTerm OR subCategories.slug LIKE :subCategorySearchTerm)',
              );
              searchParams.subCategorySearchTerm = searchTerm;
              break;
            case 'tags':
              const tagsArray = value.split(',');
              searchConditions.push('tags.name IN (:...tagsArray)');
              searchParams.tagsArray = tagsArray;
              break;
            case 'variations':
              const variationParams = value.split(',');
              const variationSearchTerm = variationParams.map(param => param.split('=')[1]).join('/');
              searchConditions.push('(variation_options.title LIKE :variationSearchTerm)');
              searchParams.variationSearchTerm = `%${variationSearchTerm}%`;
              break;
            default:
              break;
          }
        });
      }

      if (search) {
        const searchTerms = search.split(' ').map((term) => `%${term}%`);
        searchTerms.forEach((term, index) => {
          searchParams[`filterSearchTerm${index}`] = term;
        });
        const searchConditionsString = searchTerms
          .map(
            (_, index) =>
              `product.name LIKE :filterSearchTerm${index} OR product.sku LIKE :filterSearchTerm${index}`,
          )
          .join(' OR ');
        searchConditions.push(searchConditionsString);
      }

      if (searchConditions.length > 0) {
        productQueryBuilder.andWhere(
          searchConditions.join(' AND '),
          searchParams,
        );
      }
    }

    try {
      let products: Product[] = [];
      let total: number;

      // Dealer-specific handling
      if (dealerId) {
        const dealer = await this.dealerRepository.findOne({
          where: { id: dealerId },
        });

        if (!dealer) {
          throw new NotFoundException(`Dealer not found with id: ${dealerId}`);
        }

        // Fetch dealer-specific products with margins
        products = await this.fetchDealerProducts(dealerId);
        total = products.length;
      } else {
        total = await productQueryBuilder.getCount();
        productQueryBuilder.skip(startIndex).take(limit);
        products = await productQueryBuilder.cache(10000).getMany();
      }

      const url = `/products?limit=${limit}&page=${page}&shop_id=${shop_id || ''
        }&dealerId=${dealerId || ''}`;
      const paginator = paginate(total, page, limit, products.length, url);

      const result = {
        data: products,
        ...paginator,
      };

      await this.cacheManager.set(cacheKey, result, 1800); // Cache for 30 minutes
      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching products: ${error.message}`,
        error.stack,
      );
      throw new NotFoundException(error.message);
    }
  }

  // Fetch dealer products function
  private async fetchDealerProducts(dealerId: number): Promise<Product[]> {
    const marginFind = await this.dealerProductMarginRepository.find({
      where: { dealer: { id: dealerId } },
      relations: ['product'],
    })
    return marginFind.map((margin) => margin.product)
  }

  async getProductBySlug(
    slug: string,
    shop_id: number,
    dealerId?: number,
  ): Promise<Product | undefined> {
    try {
      const cacheKey = `productBySlug:${shop_id}:${slug}:${dealerId || ' '}`;
      this.logger.log(`Generated cache key: ${cacheKey}`);

      // Check cache
      const cachedResult: Product | undefined = await this.cacheManager.get(cacheKey);
      if (cachedResult) {
        this.logger.log(`Cache hit for key: ${cacheKey}`);
        return cachedResult;
      } else {
        this.logger.log(`Cache miss for key: ${cacheKey}`);
      }

      // Fetch the product with all necessary relations
      const product = await this.productRepository.createQueryBuilder('product')
        .leftJoinAndSelect('product.type', 'type')
        .leftJoinAndSelect('product.shop', 'shop')
        .leftJoinAndSelect('product.image', 'image') // Join product image
        .leftJoinAndSelect('product.categories', 'categories')
        .leftJoinAndSelect('product.subCategories', 'subCategories')
        .leftJoinAndSelect('product.tags', 'tags')

        // Join related products, images, and galleries
        .leftJoinAndSelect('product.related_products', 'related_products')
        .leftJoinAndSelect('related_products.image', 'related_product_image') // related products' image
        .leftJoinAndSelect('related_products.gallery', 'related_product_gallery') // related products' gallery

        .leftJoinAndSelect('product.variations', 'variations')
        .leftJoinAndSelect('variations.attribute', 'attribute')
        .leftJoinAndSelect('product.variation_options', 'variation_options')
        .leftJoinAndSelect('product.gallery', 'gallery') // product's own gallery
        .leftJoinAndSelect('product.my_review', 'my_review')
        .leftJoinAndSelect('product.regions', 'regions')
        .where('product.slug = :slug', { slug })
        .andWhere('product.shop_id = :shop_id', { shop_id })
        .cache(20000)
        .getOne();

      if (!product) {
        throw new NotFoundException(`Product not found with slug: ${slug}`);
      }

      // Fetch gallery only if product exists
      if (product.gallery) {
        // Check if gallery has a valid productId
        const galleryCheck = await this.productRepository.createQueryBuilder('gallery')
          .where('gallery.productId = :productId', { productId: product.id })
          .getOne();

        if (!galleryCheck) {
          throw new Error(`Gallery for product with id ${product.id} does not exist`);
        }
      }

      // If dealerId is present, apply dealer-specific margins
      if (dealerId) {
        const dealerProductMargins = await this.dealerProductMarginRepository.createQueryBuilder('margin')
          .leftJoinAndSelect('margin.product', 'productMargin')
          .where('margin.dealerId = :dealerId', { dealerId })
          .andWhere('productMargin.id = :productId', { productId: product.id })
          .getOne();

        if (dealerProductMargins) {
          product.margin = dealerProductMargins.margin;
        } else {
          // Fetch category-specific margins if product-specific margin is not available
          const categoryMargins = await this.dealerCategoryMarginRepository.createQueryBuilder('categoryMargin')
            .leftJoin('categoryMargin.category', 'category')
            .where('categoryMargin.dealerId = :dealerId', { dealerId })
            .andWhere('category.id IN (:...categoryIds)', { categoryIds: product.categories.map(c => c.id) })
            .getMany();

          const matchingMargin = categoryMargins.find(cm =>
            product.categories.some(category => category.id === cm.category.id)
          );

          if (matchingMargin) {
            product.margin = matchingMargin.margin;
          }
        }
      }

      // Fetch related products only if the product type exists
      if (product.type) {
        const relatedProducts = await this.productRepository.createQueryBuilder('related_products')
          .where('related_products.type_id = :type_id', { type_id: product.type.id })
          .andWhere('related_products.id != :productId', { productId: product.id })
          .limit(20)
          .getMany();

        product.related_products = relatedProducts;
      } else {
        product.related_products = [];
      }

      // Cache the product result for 30 minutes
      await this.cacheManager.set(cacheKey, product, 60 * 30);
      this.logger.log(`Data cached with key: ${cacheKey}`);

      return product;
    } catch (error) {
      // Handle known errors or throw internal error for unexpected issues
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        this.logger.error(`Error fetching product by slug: ${error.message}`, error.stack);
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
    const productsQueryBuilder = this.productRepository.createQueryBuilder('product')
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
      .leftJoinAndSelect('product.my_review', 'my_review')
      .leftJoinAndSelect('product.regions', 'regions');


    // Apply filters
    if (type_slug) {
      productsQueryBuilder.innerJoin('product.type', 'type')
        .where('type.slug = :typeSlug', { typeSlug: type_slug });
    }

    if (shop_id) {
      productsQueryBuilder.andWhere('product.shop_id = :shop_id', { shop_id });
    }

    if (shopName) {
      productsQueryBuilder.innerJoin('product.shop', 'shop')
        .andWhere('(shop.name = :shopName OR shop.slug = :shopName)', { shopName });
    }

    // Optionally include a search filter if provided
    if (search) {
      productsQueryBuilder.andWhere('product.name LIKE :search', { search: `%${search}%` });
    }

    // Fetch products with limit
    const products = await productsQueryBuilder.limit(limit).getMany();

    // Cache the result for 30 minutes (1800 seconds)
    await this.cacheManager.set(cacheKey, products, 60 * 30);
    this.logger.log(`Data cached with key: ${cacheKey}`);

    return products;
  }


  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'type',
        'shop',
        'categories',
        'subCategories',
        'tags',
        'image',
        'gallery',
        'variations',
        'variation_options',
        'pivot',
      ],
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const updatedProduct = Object.assign({}, product)
    for (const key in updateProductDto) {
      if (
        updateProductDto.hasOwnProperty(key) &&
        updateProductDto[key] !== updatedProduct[key]
      ) {
        updatedProduct[key] = updateProductDto[key]
      }
    }

    product.name = updateProductDto.name || product.name
    product.slug = updateProductDto.name
      ? updateProductDto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      : product.slug
    product.description = updateProductDto.description || product.description
    product.product_type = updateProductDto.product_type || product.product_type
    product.status = updateProductDto.status || product.status
    product.quantity = updateProductDto.quantity || product.quantity
    product.max_price = updateProductDto.max_price || product.max_price
    product.min_price = updateProductDto.min_price || product.min_price
    product.unit = updateProductDto.unit || product.unit
    product.language = updateProductDto.language || product.language
    product.translated_languages =
      updateProductDto.translated_languages || product.translated_languages
    product.height = updateProductDto.height
    product.length = updateProductDto.length
    product.width = updateProductDto.width
    product.sku = updateProductDto.sku

    // Update taxes if provided
    if (updateProductDto.taxes) {
      const tax = await this.taxRepository.findOne({
        where: { id: updateProductDto.taxes.id },
      })
      if (tax) {
        product.taxes = updateProductDto.taxes
      }
    }

    // Update type if provided
    if (updateProductDto.type_id) {
      const type = await this.typeRepository.findOne({
        where: { id: updateProductDto.type_id },
      })
      product.type = type
      product.type_id = type?.id
    }

    // Update shop if provided
    if (updateProductDto.shop_id) {
      const shop = await this.shopRepository.findOne({
        where: { id: updateProductDto.shop_id },
      })
      product.shop = shop
      product.shop_id = shop.id
    }

    // Update categories if provided
    if (updateProductDto.categories) {
      const categories = await this.categoryRepository.findByIds(
        updateProductDto.categories,
      )
      product.categories = categories
    }

    // Update subcategories if provided
    if (updateProductDto.subCategories) {
      const subCategories = await this.subCategoryRepository.findByIds(
        updateProductDto.subCategories,
      )
      product.subCategories = subCategories
    }

    // Update tags if provided
    if (updateProductDto.tags) {
      const tags = await this.tagRepository.findByIds(updateProductDto.tags)
      product.tags = tags
    }

    // Update image if provided
    if (updateProductDto.image) {
      const existingImage = product.image ? product.image.id : null
      const updatedImage = updateProductDto.image.id

      // Identify image to be removed
      if (existingImage && existingImage !== updatedImage) {
        const image = product.image
        product.image = null
        await this.productRepository.save(product)
        await this.attachmentRepository.remove(image)
      }

      // Add new image
      if (!existingImage || existingImage !== updatedImage) {
        const image = await this.attachmentRepository.findOne({
          where: { id: updatedImage },
        })
        product.image = image
      }
    }

    // Update gallery if provided
    if (updateProductDto.gallery) {
      const existingGalleryImages = product.gallery.map(
        (galleryImage) => galleryImage.id,
      )
      const updatedGalleryImages = updateProductDto.gallery.map(
        (galleryImage) => galleryImage.id,
      )

      // Identify images to be removed
      const imagesToRemove = existingGalleryImages.filter(
        (id) => !updatedGalleryImages.includes(id),
      )

      // Remove images
      for (const imageId of imagesToRemove) {
        const image = product.gallery.find(
          (galleryImage) => galleryImage.id === imageId,
        )
        product.gallery.splice(product.gallery.indexOf(image!), 1)
        await this.attachmentRepository.remove(image)
      }

      // Add new images
      const newGalleryImages = updateProductDto.gallery.filter(
        (galleryImage) => !existingGalleryImages.includes(galleryImage.id),
      )
      for (const newGalleryImage of newGalleryImages) {
        const image = await this.attachmentRepository.findOne({
          where: { id: newGalleryImage.id },
        })
        product.gallery.push(image)
      }
    }

    // Update variations if provided
    if (updateProductDto.variations) {
      // Ensure product.variations is an array
      product.variations = Array.isArray(product.variations)
        ? product.variations
        : []
      const existingVariations = product.variations.map(
        (variation) => variation.attribute_value_id,
      )
      // Ensure updateProductDto.variations is an array
      const updateVariations = Array.isArray(updateProductDto.variations)
        ? updateProductDto.variations
        : []
      const newVariations = updateVariations.filter(
        (variation) =>
          !existingVariations.includes(variation.attribute_value_id),
      )
      for (const newVariation of newVariations) {
        const variation = await this.attributeValueRepository.findOne({
          where: { id: newVariation.attribute_value_id },
        })
        if (variation) {
          product.variations.push(variation)
        }
      }
      // Remove the association between the Product and AttributeValue which is not in the updated product variation
      const variationsToRemove = existingVariations.filter(
        (variation) =>
          !updateVariations
            .map((v) => v.attribute_value_id)
            .includes(variation),
      )
      for (const variationId of variationsToRemove) {
        const variationIndex = product.variations.findIndex(
          (v) => v.attribute_value_id === variationId,
        )
        if (variationIndex !== -1) {
          product.variations.splice(variationIndex, 1)
        }
      }
    }

    // Update variation options if provided
    if (
      updateProductDto.product_type === 'variable' &&
      updateProductDto.variation_options
    ) {
      const existingVariations = product.variation_options.map(
        (variation) => variation.id,
      )
      const upsertVariations = Array.isArray(
        updateProductDto.variation_options.upsert,
      )
        ? updateProductDto.variation_options.upsert
        : []
      for (const upsertVariationDto of upsertVariations) {
        let variation
        if (existingVariations.includes(upsertVariationDto.id)) {
          variation = product.variation_options.find(
            (variation) => variation.id === upsertVariationDto.id,
          )
        } else {
          variation = new Variation()
          product.variation_options.push(variation)
        }
        variation.title = upsertVariationDto.title
        variation.price = upsertVariationDto.price
        variation.sku = upsertVariationDto.sku
        variation.is_disable = upsertVariationDto.is_disable
        variation.sale_price = upsertVariationDto.sale_price
        variation.quantity = upsertVariationDto.quantity
        if (upsertVariationDto.image) {
          let image = await this.attachmentRepository.findOne({
            where: { id: upsertVariationDto.image.id },
          })
          if (!image) {
            image = new Attachment()
            image.id = upsertVariationDto.image.id
            image.original = upsertVariationDto.image.original
            image.thumbnail = upsertVariationDto.image.thumbnail
            await this.attachmentRepository.save(image)
          }
          variation.image = image
        }
        // Ensure variation.options is an array
        variation.options = Array.isArray(variation.options)
          ? variation.options
          : []
        const existingOptionIds = variation.options.map((option) => option.id)
        const updatedOptionIds = upsertVariationDto.options.map(
          (option) => option.id,
        )
        const optionsToRemove = existingOptionIds.filter(
          (id) => !updatedOptionIds.includes(id),
        )
        for (const optionId of optionsToRemove) {
          const option = variation.options.find(
            (option) => option.id === optionId,
          )
          if (option) {
            variation.options.splice(variation.options.indexOf(option), 1)
            await this.variationOptionRepository.remove(option)
          }
        }
        const newOptions = upsertVariationDto.options.filter(
          (option) => !existingOptionIds.includes(option.id),
        )
        for (const newOptionDto of newOptions) {
          const newOption = new VariationOption()
          newOption.id = newOptionDto.id
          newOption.name = newOptionDto.name
          newOption.value = newOptionDto.value
          await this.variationOptionRepository.save(newOption)
          variation.options.push(newOption)
        }
        await this.variationRepository.save(variation)
      }
      if (updateProductDto.variation_options.delete) {
        for (const deleteId of updateProductDto.variation_options.delete) {
          const variation = await this.variationRepository.findOne({
            where: { id: deleteId },
            relations: ['options', 'image'],
          })
          if (!variation) {
            throw new NotFoundException('Variation not found')
          }
          const variationImage = variation.image
          if (variationImage) {
            variation.image = null
            await this.attachmentRepository.remove(variationImage)
          }
          await this.variationRepository.remove(variation)
        }
      }
    }

    // Update variation if provided
    if (updateProductDto.variation) {
      const variation = await this.variationRepository.findOne({
        where: { id: updateProductDto.variation.id },
      })
      if (variation) {
        product.variation = variation
      }
    }

    // Region-based functionality
    if (updateProductDto.regionName) {
      const regionNames: string[] = Array.isArray(updateProductDto.regionName)
        ? updateProductDto.regionName
        : [updateProductDto.regionName]

      if (regionNames && regionNames.length > 0) {
        const regions = await this.regionRepository.find({
          where: {
            name: In(regionNames),
          },
        })

        const existingRegionNames = regions.map((region) => region.name)
        const missingRegionNames = regionNames.filter(
          (name) => !existingRegionNames.includes(name),
        )

        // Handle missing regions
        if (missingRegionNames.length > 0) {
          // Logic to create missing regions
        }

        // Assign regions to the product
        product.regions = regions
      }
    }

    // Save updated product
    return await this.productRepository.save(product)
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
        'subCategories', // Make sure to include subCategories relation
      ],
    })
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    // Remove associations with tags
    product.tags = []

    // Remove association with type
    product.type = null

    // Remove associations with orders
    product.related_products = []

    // Remove associations with related products
    product.orders = []

    // Save the changes to update the associations in the database
    await this.productRepository.save(product)

    // Remove associations with categories
    if (product.categories) {
      await Promise.all(
        product.categories.map(async (category) => {
          if (category.products) {
            category.products = category.products.filter(
              (p) => p.id !== product.id,
            )
            await this.categoryRepository.save(category)
          }
        }),
      )
    }

    // Find related records in the dealer_product_margin table
    const relatedRecords = await this.dealerProductMarginRepository.find({
      where: { product: { id: product.id } },
    })

    // Delete related records
    await Promise.all(
      relatedRecords.map(async (record) => {
        await this.dealerProductMarginRepository.delete(record.id)
      }),
    )

    // Remove associations with subcategories
    if (product.subCategories) {
      await Promise.all(
        product.subCategories.map(async (subCategory) => {
          if (subCategory.products) {
            subCategory.products = subCategory.products.filter(
              (p) => p.id !== product.id,
            )
            await this.subCategoryRepository.save(subCategory)
          }
        }),
      )
    }

    if (product.image) {
      const image = product.image
      product.image = null
      await this.productRepository.save(product)
      const V_image = await this.attachmentRepository.findOne({
        where: { id: image.id },
      })
      if (V_image) {
        await this.attachmentRepository.remove(V_image)
      }
      await this.attachmentRepository.remove(image)
    }

    // Remove gallery attachments
    if (product.gallery && product.gallery.length > 0) {
      const gallery = await this.attachmentRepository.findByIds(
        product.gallery.map((g) => g.id),
      )
      await this.attachmentRepository.remove(gallery)
    }

    // Fetch related entities
    const variations = await Promise.all(
      product.variation_options.map(async (v) => {
        const variation = await this.variationRepository.findOne({
          where: { id: v.id },
          relations: ['options', 'image'],
        })
        if (!variation) {
          throw new NotFoundException(`Variation with ID ${v.id} not found`)
        }
        return variation
      }),
    )

    // Handle removal of variations, images, and options
    await Promise.all([
      ...variations.flatMap((v) =>
        v.options ? [this.variationOptionRepository.remove(v.options)] : [],
      ),
      ...variations.map(async (v) => {
        if (v.image && v.image.length > 0) {
          const images = v.image
          v.image = null // Unlink the image from the variation
          await this.variationRepository.save(v)

          // Remove images if they exist
          await Promise.all(
            images.map(async (image) => {
              const attachment = await this.attachmentRepository.findOne({
                where: { id: image.id },
              })
              if (attachment) {
                await this.attachmentRepository.remove(attachment)
              }
            }),
          )
        }
      }),
      this.variationRepository.remove(variations), // Remove the variations
      this.productRepository.remove(product), // Remove the product
    ])
  }

  async updateQuantity(
    id: number,
    updateQuantityDto: UpdateQuantityDto,
  ): Promise<void> {
    try {
      // Update only the quantity field
      await this.productRepository.update(id, {
        quantity: updateQuantityDto.quantity,
      })
    } catch (err) {
      // Handle errors appropriately
      throw err
    }
  }
}

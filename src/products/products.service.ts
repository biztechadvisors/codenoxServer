import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
import { Category } from 'src/categories/entities/category.entity';
import { AttributeValueRepository } from 'src/attributes/attribute.repository';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';

const options = {
  keys: [
    'name',
    'type.slug',
    'categories.slug',
    'status',
    'shop_id',
    'author.slug',
    'tags',
    'manufacturer.slug',
  ],
  threshold: 0.3,
};

@Injectable()
export class ProductsService {

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
    @InjectRepository(AttributeValue) private readonly attributeValueRepository: AttributeValueRepository,
    @InjectRepository(File) private readonly fileRepository: FileRepository,

  ) { }

  async create(createProductDto: CreateProductDto) {

    const product = new Product();
    product.name = createProductDto.name;
    product.slug = createProductDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    product.description = createProductDto.description;
    product.product_type = createProductDto.product_type;
    product.status = createProductDto.status;
    product.quantity = createProductDto.quantity;
    product.unit = createProductDto.unit;

    // Set type
    const type = await this.typeRepository.findOne({ where: { id: createProductDto.type_id } });
    product.type = type;
    product.type_id = type.id

    // Set shop
    const shop = await this.shopRepository.findOne({ where: { id: createProductDto.shop_id } });
    product.shop = shop;

    // Set categories
    const categories = await this.categoryRepository.findByIds(createProductDto.categories);
    product.categories = categories;

    // Set tags
    const tags = await this.tagRepository.findByIds(createProductDto.tags);
    product.tags = tags;

    // Set image
    if (createProductDto.image) {
      let image = await this.attachmentRepository.findOne({ where: { id: createProductDto.image.id } });
      product.image = image;
    }

    // Set gallery
    if (createProductDto.gallery) {
      const galleryAttachments = [];

      for (const galleryImage of createProductDto.gallery) {
        let image = await this.attachmentRepository.findOne({ where: { id: galleryImage.id } });
        galleryAttachments.push(image);
      }

      product.gallery = galleryAttachments;
    }

    if (createProductDto.variations) {
      const attributeValues: AttributeValue[] = [];

      for (const variation of createProductDto.variations) {
        const attributeValue = await this.attributeValueRepository.findOne({ where: { id: variation.attribute_value_id } });

        if (attributeValue) {
          attributeValues.push(attributeValue);
        }
      }

      product.variations = attributeValues;
    }

    // Save the product
    await this.productRepository.save(product);

    if (createProductDto.product_type === 'variable' && createProductDto.variation_options && createProductDto.variation_options.upsert) {
      const variationOPt = [];

      for (const variationDto of createProductDto.variation_options.upsert) {
        const newVariation = new Variation();
        newVariation.title = variationDto.title;
        newVariation.price = variationDto.price;
        newVariation.sku = variationDto.sku;
        newVariation.is_disable = variationDto.is_disable;
        newVariation.sale_price = variationDto.sale_price;
        newVariation.quantity = variationDto.quantity;

        // Set image
        if (variationDto.image) {
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
        // Save each variation
        await this.variationRepository.save(newVariation);
        variationOPt.push(newVariation);
      }

      // Then establish the relationship
      product.variation_options = variationOPt;
      await this.productRepository.save(product);
    }

    return product;
  }

  async getProducts({ limit = 30, page = 1, search }: GetProductsDto): Promise<ProductPaginator> {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Construct the query builder
    const productQueryBuilder = this.productRepository.createQueryBuilder('product');

    // Apply search filtering if search parameter is provided
    if (search) {
      const parseSearchParams = search.split(';');
      const searchConditions: any[] = [];

      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');

        // Handle search by product name
        if (key === 'name') {
          searchConditions.push({ name: `%${value}%` });
        }

        // Handle search by other product attributes
        else if (key !== 'slug') {
          // Construct a search condition using the attribute key and value
          searchConditions.push({ [key]: `%${value}%` });
        }
      }

      // Apply search conditions using 'and' operator
      if (searchConditions.length > 0) {
        productQueryBuilder.andWhere(searchConditions); // Use array instead of spreading
      }
    }

    // Set the desired relations to fetch
    productQueryBuilder
      .leftJoinAndSelect('product.type', 'type')
      .leftJoinAndSelect('product.shop', 'shop')
      .leftJoinAndSelect('product.image', 'image')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.related_products', 'related_products')
      .leftJoinAndSelect('product.variations', 'variations')
      .leftJoinAndSelect('product.variation_options', 'variation_options')
      .leftJoinAndSelect('product.gallery', 'gallery');

    // Apply pagination limits
    productQueryBuilder.skip(startIndex).take(limit);

    // Execute the query and get results
    const products = await productQueryBuilder.getMany();

    // Construct the pagination data
    const url = `/products?search=${search}&limit=${limit}`;
    const paginator = paginate(products.length, page, limit, products.length, url);

    // Return the product data and pagination information
    return {
      data: products,
      ...paginator,
    };
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    // Fetch the product using the slug
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['type', 'shop', 'image', 'categories', 'tags', 'gallery', 'related_products', 'variations', 'variation_options'],
    });

    // Fetch related products using type_id
    if (product) {
      const relatedProducts = await this.productRepository.createQueryBuilder('related_products')
        .where('related_products.type_id = :type_id', { type_id: product.type.id }) // Use related_products.type_id instead of relatedProduct.type.slug
        .andWhere('related_products.id != :productId', { productId: product.id })
        .limit(20)
        .getMany();

      product.related_products = relatedProducts;
    }

    return product;
  }

  async getPopularProducts(query: GetPopularProductsDto): Promise<Product[]> {
    const { limit = 10, type_slug, shop_id } = query;

    let productsQueryBuilder = this.productRepository.createQueryBuilder('product');

    if (type_slug) {
      productsQueryBuilder.where('product.type.slug = :typeSlug', { type_slug });
    }

    if (shop_id) {
      productsQueryBuilder.andWhere('product.shop.id = :shopId', { shop_id });
    }

    productsQueryBuilder
      .leftJoinAndSelect('product.type', 'type')
      .leftJoinAndSelect('product.shop', 'shop')
      .leftJoinAndSelect('product.image', 'image')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.related_products', 'related_products')
      .leftJoinAndSelect('product.variations', 'variations')
      .leftJoinAndSelect('product.variation_options', 'variation_options');

    const products = await productsQueryBuilder.limit(limit).getMany();
    return products;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    console.log("Updated-Product", updateProductDto)
    const product = await this.productRepository.findOne({ where: { id: id }, relations: ['type', 'shop', 'categories', 'tags', 'image', 'gallery', 'variations', 'variation_options'] });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.name = updateProductDto.name || product.name;
    product.slug = updateProductDto.name ? updateProductDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : product.slug;
    product.description = updateProductDto.description || product.description;
    product.product_type = updateProductDto.product_type || product.product_type;
    product.status = updateProductDto.status || product.status;
    product.quantity = updateProductDto.quantity || product.quantity;
    product.unit = updateProductDto.unit || product.unit;

    if (updateProductDto.type_id) {
      const type = await this.typeRepository.findOne({ where: { id: updateProductDto.type_id } });
      product.type = type;
      product.type_id = type.id;
    }

    if (updateProductDto.shop_id) {
      const shop = await this.shopRepository.findOne({ where: { id: updateProductDto.shop_id } });
      product.shop = shop;
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
      let image = await this.attachmentRepository.findOne({ where: { id: updateProductDto.image.id } });
      product.image = image;
    }

    if (updateProductDto.gallery) {
      const galleryAttachments = [];
      for (const galleryImage of updateProductDto.gallery) {
        let image = await this.attachmentRepository.findOne({ where: { id: galleryImage.id } });
        galleryAttachments.push(image);
      }
      product.gallery = galleryAttachments;
    }

    if (updateProductDto.variations) {
      const attributeValues: AttributeValue[] = [];
      for (const variation of updateProductDto.variations) {
        const attributeValue = await this.attributeValueRepository.findOne({ where: { id: variation.attribute_value_id } });
        if (attributeValue) {
          attributeValues.push(attributeValue);
        }
      }
      product.variations = attributeValues;
    }

    await this.productRepository.save(product);

    if (updateProductDto.product_type === 'variable' && updateProductDto.variation_options && updateProductDto.variation_options.upsert) {
      const variationOPt = [];
      for (const variationDto of updateProductDto.variation_options.upsert) {
        const newVariation = new Variation();
        newVariation.title = variationDto.title;
        newVariation.price = variationDto.price;
        newVariation.sku = variationDto.sku;
        newVariation.is_disable = variationDto.is_disable;
        newVariation.sale_price = variationDto.sale_price;
        newVariation.quantity = variationDto.quantity;
        if (variationDto.image) {
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

    return product;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}

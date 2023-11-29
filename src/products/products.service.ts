/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { OrderProductPivot, Product, ProductType, Variation, VariationOption } from './entities/product.entity';
import { paginate } from 'src/common/pagination/paginate';
import productsJson from '@db/products.json';
import Fuse from 'fuse.js';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderProductPivotRepository, ProductRepository, VariationOptionRepository, VariationRepository } from './products.repository';
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
import { AttributeRepository, AttributeValueRepository } from 'src/attributes/attribute.repository';
import { Attribute } from 'src/attributes/entities/attribute.entity';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';

const products: Product[] = plainToClass(Product, productsJson);

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

const fuse = new Fuse(products, options);

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

  ) { }

  private products: any = products;

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

    // if (createProductDto.variations) {
    //   const attributeValues: AttributeValue[] = [];

    //   for (const variation of createProductDto.variations) {
    //     const attributeValue = await this.attributeValueRepository.findOne({ where: { id: variation.attributeValueId } });

    //     if (attributeValue) {
    //       attributeValues.push(attributeValue);
    //     }
    //   }

    //   product.attributeValues = attributeValues;
    // }

    if (createProductDto.product_type === 'variable' && createProductDto.variation_options && createProductDto.variation_options.upsert) {
      const variationOPt = [];

      for (const variation of createProductDto.variation_options.upsert) {
        const newVariation = new Variation();
        newVariation.title = variation.title;
        newVariation.price = variation.price;
        newVariation.sku = variation.sku;
        newVariation.is_disable = variation.is_disable;
        newVariation.sale_price = variation.sale_price;
        newVariation.quantity = variation.quantity;

        const variationOptions = [];

        for (const option of variation.options) {
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
  }

  getProducts({ limit = 30, page = 1, search }: GetProductsDto): ProductPaginator {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Product[] = this.products;
    if (search) {
      const parseSearchParams = search.split(';')
      const searchText: any = []
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          })
        }
      }
      const searchData = fuse.search({ $and: searchText });
      data = searchData ? searchData.map(({ item }) => item) : [];
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/products?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    }
  }

  getProductBySlug(slug: string): Product {
    const product = this.products.find((p) => p.slug === slug)
    const related_products = this.products
      .filter((p) => p.type.slug === product.type.slug)
      .slice(0, 20)
    return {
      ...product,
      related_products,
    }
  }

  getPopularProducts({ limit = 10, type_slug }: GetPopularProductsDto): Product[] {
    let data: any = this.products;
    if (type_slug) {
      const searchData = fuse.search(type_slug);
      data = searchData ? searchData.map(({ item }) => item) : [];
    }
    return data.slice(0, limit);
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.products[0]
  }

  remove(id: number) {
    return `This action removes a #${id} product`
  }
}

/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { paginate } from 'src/common/pagination/paginate';
import productsJson from '@db/products.json';
import Fuse from 'fuse.js';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderProductPivotRepository, ProductRepository, VariationOptionRepository, VariationRepository } from './products.repository';
import { AttachmentRepository } from 'src/common/common.repository';

const products: Product[] = plainToClass(Product, [productsJson]);

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
    @InjectRepository(ProductRepository) private productRepository: ProductRepository,
    @InjectRepository(OrderProductPivotRepository) private orderProductPivotRepository: OrderProductPivotRepository,
    @InjectRepository(VariationRepository) private variationRepository: VariationRepository,
    @InjectRepository(VariationOptionRepository) private variationOptionRepository: VariationOptionRepository,
    @InjectRepository(AttachmentRepository) private attachmentRepository: AttachmentRepository,

  ) { }

  private products: any = products;

  create(createProductDto: CreateProductDto) {
    console.log("Product-data********", createProductDto)
    return this.products[0];
  }

  getProducts({ limit = 30, page = 1, search }: GetProductsDto): ProductPaginator {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Construct the query builder
    const productQueryBuilder = this.productRepository.createQueryBuilder('product');

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

    // Apply search filtering if search parameter is provided
    if (search) {
      const parseSearchParams = search.split(';');
      const searchConditions: any[] = [];

      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');

        if (key === 'name') {
          searchConditions.push({ name: `%${value}%` });
        } else if (key === 'category') {
          const searchTerm = value;
          productQueryBuilder.where(qb => {
            qb.orWhere('categories.name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
            qb.orWhere('categories.description LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
          });
        } else if (key === 'slug' && value.includes('category:')) {
          const categorySlug = value.split('category:')[1];
          productQueryBuilder.andWhere(`categories.slug LIKE :searchParam`, { searchParam: `%${categorySlug}%` });
        } else {
          searchConditions.push({ [key]: `%${value}%` });
        }
      }

      if (searchConditions.length > 0) {
        searchConditions.forEach(condition => {
          Object.entries(condition).forEach(([key, value]) => {
            if (key !== 'type.slug') {
              productQueryBuilder.andWhere(`product.${key} LIKE :value`, { value });
            }
          });
        });
      }
    }

    productQueryBuilder.skip(startIndex).take(limit);
    const products = await productQueryBuilder.getMany();
    const url = `/products?search=${search}&limit=${limit}`;
    const paginator = paginate(products.length, page, limit, products.length, url);
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

    // Update OrderProductPivot
    if (updateProductDto.pivot) {
      const pivot = product.pivot;
      if (pivot) {
        pivot.order_quantity = updateProductDto.pivot.order_quantity || pivot.order_quantity;
        pivot.unit_price = updateProductDto.pivot.unit_price || pivot.unit_price;
        pivot.subtotal = updateProductDto.pivot.subtotal || pivot.subtotal;
        await this.orderProductPivotRepository.save(pivot);
      } else {
        const newPivot = new OrderProductPivot();
        newPivot.order_quantity = updateProductDto.pivot.order_quantity;
        newPivot.unit_price = updateProductDto.pivot.unit_price;
        newPivot.subtotal = updateProductDto.pivot.subtotal;
        newPivot.product = product;
        await this.orderProductPivotRepository.save(newPivot);
        product.pivot = newPivot;
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

  remove(id: number) {
    return `This action removes a #${id} product`
  }
}

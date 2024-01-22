/* eslint-disable prettier/prettier */
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
import { Dealer, DealerCategoryMargin, DealerProductMargin } from 'src/users/entities/dealer.entity';
import { DealerCategoryMarginRepository, DealerProductMarginRepository, DealerRepository, UserRepository } from 'src/users/users.repository';
import { User } from 'src/users/entities/user.entity';
import items from 'razorpay/dist/types/items';
import { clearConfigCache } from 'prettier';


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
    @InjectRepository(Dealer) private readonly dealerRepository: DealerRepository,
    @InjectRepository(DealerProductMargin) private readonly dealerProductMarginRepository: DealerProductMarginRepository,
    @InjectRepository(DealerCategoryMargin) private readonly dealerCategoryMarginRepository: DealerCategoryMarginRepository,
    @InjectRepository(User) private readonly userRepository: UserRepository,

  ) { }

  async create(createProductDto: CreateProductDto) {
    const product = new Product();
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
    const type = await this.typeRepository.findOne({ where: { id: createProductDto.type_id } });
    if (!type) {
      throw new NotFoundException(`Type with ID ${createProductDto.type_id} not found`);
    }
    product.type = type;
    product.type_id = type.id;
    const shop = await this.shopRepository.findOne({ where: { id: createProductDto.shop_id } });
    product.shop = shop;
    product.shop_id = shop.id;
    const categories = await this.categoryRepository.findByIds(createProductDto.categories);
    product.categories = categories;
    const tags = await this.tagRepository.findByIds(createProductDto.tags);
    product.tags = tags;
    if (createProductDto.image) {
      const image = await this.attachmentRepository.findOne({ where: { id: createProductDto.image.id } });
      product.image = image;
    }
    if (createProductDto.gallery) {
      const galleryAttachments = [];
      for (const galleryImage of createProductDto.gallery) {
        const image = await this.attachmentRepository.findOne({ where: { id: galleryImage.id } });
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
    console.log("createProductDto", createProductDto.shop_id)
    return product;
  }; 

  async getProducts({ limit = 30, page = 1, search, userId }: GetProductsDto): Promise<ProductPaginator> {

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let productsWithMargins: any
    let productsWithCategoryMargins: any

    const productQueryBuilder = this.productRepository.createQueryBuilder('product');
    productQueryBuilder
      .leftJoinAndSelect('product.type', 'type')
      .leftJoinAndSelect('product.shop', 'shop')
      .leftJoinAndSelect('product.image', 'image')
      .leftJoinAndSelect('product.categories', 'categories')
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
        }
        else if (key === 'type.slug') {
          productQueryBuilder.andWhere(`type.slug LIKE :searchParam`, { searchParam: `%${value}%` });
        }
        else {
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

    try{
      const dealer = await this.dealerRepository.find({
        where: { id: userId },
        relations: ['dealerProductMargins', 'dealerCategoryMargins']
      })

      if(dealer){
        for (const dealerId of dealer){
           
          if(dealerId.dealerProductMargins){
            console.log("margin", dealerId.dealerProductMargins)
            const marginFind = await this.dealerProductMarginRepository.find({
              relations: ['product']
            })
             productsWithMargins = marginFind.reduce((result, margin) => {
              const product = margin.product;
              product.margin = margin.margin; 
              result.push(product);
              return result;
            }, []);
            console.log("dealer Product Margin", marginFind)
            console.log("dealer Product Margin", productsWithMargins)
              
            productQueryBuilder.skip(startIndex).take(limit);
            const products = productsWithMargins;
            // const products = await productQueryBuilder.getMany();
            const url = `/products?search=${search}&limit=${limit}`;
            const paginator = paginate(products.length, page, limit, products.length, url);
        
            return {
              data: products,
              ...paginator,
            };

          }else{
            if(dealerId.dealerCategoryMargins){
              console.log("margin", dealerId.dealerCategoryMargins)
              const marginFind = await this.dealerCategoryMarginRepository.find({
                relations: ['category']
              })

              if(marginFind){

                  for(const findId of marginFind){
                     const found = findId.category.id
                    const findCatProd = await this.categoryRepository.find({
                      where: {id: found},
                      relations: ['products']
                    })

                    for(const produ of findCatProd){
                      if (produ && produ.products) {
                            const productsWithCategoryMargins = produ.products.map((product) => {
                            const matchingMargin = findId.margin
                            product.margin = matchingMargin;           
                            return product;
                        });     
                        console.log("Products with category margins:", productsWithCategoryMargins);
                      }
                    }  
                  }         
              }
              productQueryBuilder.skip(startIndex).take(limit);
              const products = productsWithCategoryMargins;
              // const products = await productQueryBuilder.getMany();
              const url = `/products?search=${search}&limit=${limit}`;
              const paginator = paginate(products.length, page, limit, products.length, url);
          
              return {
                data: products,
                ...paginator,
              };

            }else {
              productQueryBuilder.skip(startIndex).take(limit);
              const products = await productQueryBuilder.getMany();
              const url = `/products?search=${search}&limit=${limit}`;
              const paginator = paginate(products.length, page, limit, products.length, url);
          
              return {
                data: products,
                ...paginator,
              };
            }
          }
        }        
      }else {
        productQueryBuilder.skip(startIndex).take(limit);
        const products = await productQueryBuilder.getMany();
        const url = `/products?search=${search}&limit=${limit}`;
        const paginator = paginate(products.length, page, limit, products.length, url);
    
        return {
          data: products,
          ...paginator,
        };
      }
    }catch(error){
      throw new NotFoundException(error);
    }
   

    // productQueryBuilder.skip(startIndex).take(limit);
    // // const products = productsWithMargins;
    // const products = await productQueryBuilder.getMany();
    // const url = `/products?search=${search}&limit=${limit}`;
    // const paginator = paginate(products.length, page, limit, products.length, url);

    // return {
    //   data: products,
    //   ...paginator,
    // };
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    // Fetch the product using the slug
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: [
        'type',
        'shop',
        'image',
        'categories',
        'tags',
        'gallery',
        'related_products',
        'variations.attribute', // Include attribute for variations
        'variation_options.options', // Include options for variation_options
      ],
    });

    // Destructuring variations and variation_options
    if (product) {
      // Destructuring variations
      product.variations = product.variations.map((variation) => ({
        ...variation,
        attribute: variation.attribute, // Extract attribute value
      }));

      // Destructuring variation_options
      product.variation_options = product.variation_options.map((option) => ({
        ...option,
        options: option.options.map((optionAttribute) => optionAttribute), // Extract option values
      }));
    }

    // Fetch related products using type_id
    if (product) {
      const relatedProducts = await this.productRepository.createQueryBuilder('related_products')
        .where('related_products.type_id = :type_id', { type_id: product.type_id })
        .andWhere('related_products.id != :productId', { productId: product.id })
        .limit(20)
        .getMany();

      product.related_products = relatedProducts;
    }

    return product;
  }

  async getPopularProducts(query: GetPopularProductsDto): Promise<Product[]> {
    const { limit = 10, type_slug, shop_id } = query;

    const productsQueryBuilder = this.productRepository.createQueryBuilder('product');

    if (type_slug) {
      productsQueryBuilder.innerJoinAndSelect('product.type', 'type', 'type.slug = :typeSlug', { typeSlug: type_slug });
    }

    if (shop_id) {
      productsQueryBuilder.andWhere('product.shop_id = :shopId', { shopId: shop_id });
    }

    productsQueryBuilder
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
    const product = await this.productRepository.findOne({ where: { id: id }, relations: ['type', 'shop', 'image', 'categories', 'tags', 'gallery', 'related_products', 'variations', 'variation_options'] });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
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
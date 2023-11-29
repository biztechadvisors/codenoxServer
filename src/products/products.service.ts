/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateProductDto } from './dto/create-product.dto'
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { Product, Variation, VariationOption } from './entities/product.entity'
import { paginate } from 'src/common/pagination/paginate'
// import productsJson from '@db/products.json';
// import Fuse from 'fuse.js';
import { GetPopularProductsDto } from './dto/get-popular-products.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { ProductRepository, VariationOptionRepository, VariationRepository } from './products.repository'
import { AttributeRepository, AttributeValueRepository } from 'src/attributes/attribute.repository'
import { promises } from 'dns'
import { Attribute } from 'src/attributes/entities/attribute.entity'
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity'

@Injectable()
export class ProductsService {
  products: Product[]
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: AttributeRepository,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: AttributeValueRepository,
    @InjectRepository(Product)
    private readonly productsRepository: ProductRepository,
    @InjectRepository(Variation)
    private readonly variationRepository: VariationRepository,
    @InjectRepository(VariationOption)
    private readonly optionRepository: VariationOptionRepository,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {

    // console.log('Ram*****',createProductDto)
    const product = new Product();
    product.name = createProductDto.name;
    product.slug = createProductDto.slug;
    product.type_id = createProductDto.type_id;
    product.shop_id = createProductDto.shop_id;
    product.description = createProductDto.description;
    product.in_stock = createProductDto.in_stock;
    product.is_taxable = createProductDto.is_taxable;
    product.sale_price = createProductDto.sale_price;
    product.max_price = createProductDto.max_price;
    product.min_price = createProductDto.min_price;
    product.sku = createProductDto.sku;
    product.height = createProductDto.height;
    product.length = createProductDto.length;
    product.width = createProductDto.width;
    product.price = createProductDto.price;
    product.quantity = createProductDto.quantity;
    product.unit = createProductDto.unit;
    product.ratings = createProductDto.ratings;
    product.in_wishlist = createProductDto.in_wishlist;
    product.language = createProductDto.language;
  
    // console.log(createProductDto.variation_options);

    if (Array.isArray(createProductDto.variations) && createProductDto.variations.length > 0) {
      const variationData = await Promise.all(
        createProductDto.variations.map(async (variations) => {
          try {
            if (Array.isArray(variations.attribute.values) && variations.attribute.values.length > 0) {
              variations.attribute.values.map( async (valuedata)=>{
                console.log(valuedata)
                // product.variations = value
                const existingValues = await this.attributeValueRepository.find({
                  where:{value: valuedata.value, meta: valuedata.meta}
                })
                product.variations = existingValues[0]
                console.log(existingValues[0].id)
              })
            }
          } catch (error) {
            console.error('Error fetching attribute for variations', variations, error);
            // Handle the error or continue processing accordingly
            return null;
          }
        })
      );
    } else {
      console.log('Variation Not');
    }
    
  
    // if (Array.isArray(createProductDto.variation_options) && createProductDto.variation_options.length > 0) {
    //   const variations = await Promise.all(
    //     createProductDto.variation_options.map(async (variationDto) => {
    //       const variation = new Variation();
    //       variation.title = variationDto.title;
    //       variation.price = variationDto.price;
    //       variation.sku = variationDto.sku;
    //       variation.is_disable = variationDto.is_disable;
    //       variation.sale_price = variationDto.sale_price;
    //       variation.quantity = variationDto.quantity;
  
    //       if (Array.isArray(variationDto.options) && variationDto.options.length > 0) {
    //         const options = await Promise.all(
    //           variationDto.options.map(async (optionDto) => {
    //             const variationOption = new VariationOption();
    //             variationOption.name = optionDto.name
    //             variationOption.value = optionDto.value
    //             console.log(variationOption)
                
    //             return await this.optionRepository.save(variationOption);
    //           })
    //         );
    //         variation.options = options;
    //       }
    //       console.log(variation)
    //       return await this.variationRepository.save(variation);
    //     })
    //   );
    //   product.variation_options = variations;
    // }
    // const savedProduct = await this.productsRepository.save(product);
    // console.log('Product with variations:', product);
  
    // console.log(savedProduct.variations);
    // console.log(savedProduct.variation_options);
  
    return product;
  }
  

  // getProducts({ limit = 30, page = 1, search }: GetProductsDto): ProductPaginator {
  //   const startIndex = (page - 1) * limit;
  //   const endIndex = page * limit;
  //   let data: Product[] = this.products;
  //   if (search) {
  //     const parseSearchParams = search.split(';');
  //     const searchText: any = [];
  //     for (const searchParam of parseSearchParams) {
  //       const [key, value] = searchParam.split(':');
  //       if (key !== 'slug') {
  //         searchText.push({
  //           [key]: value,
  //         });
  //       }
  //     }
  //     const searchData = fuse.search({ $and: searchText });
  //     data = searchData ? searchData.map(({ item }) => item) : [];
  //   }
  //   const results = data.slice(startIndex, endIndex);
  //   const url = `/products?search=${search}&limit=${limit}`;
  //   return {
  //     data: results,
  //     ...paginate(data.length, page, limit, results.length, url),
  //   };
  // }

  // getProductBySlug(slug: string): Product {
  //   const product = this.products.find((p) => p.slug === slug);
  //   const related_products = this.products
  //     .filter((p) => p.type.slug === product.type.slug)
  //     .slice(0, 20);
  //   return {
  //     ...product,
  //     related_products,
  //   };
  // }

  // getPopularProducts({ limit = 10, type_slug }: GetPopularProductsDto): Product[] {
  //   let data: any = this.products;
  //   if (type_slug) {
  //     const searchData = fuse.search(type_slug);
  //     data = searchData ? searchData.map(({ item }) => item) : [];
  //   }
  //   return data.slice(0, limit);
  // }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.products[0];
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}

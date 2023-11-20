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

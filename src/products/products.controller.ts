/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateQuantityDto } from './dto/update-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { Product } from './entities/product.entity';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async getProducts(@Query() query: GetProductsDto): Promise<ProductPaginator> {
    console.log("query******", query)
    return this.productsService.getProducts(query);
  }

  @Get(':slug/:id')
  async getProductBySlug(
    @Param('slug') slug: string,
    @Param('id') id: number
  ): Promise<Product> {

    console.log("slug, id**************", slug, id)
    return this.productsService.getProductBySlug(slug, id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Post(':id')
  async updateQuantity(@Param('id') id: string, @Body() updateQuantityDto: UpdateQuantityDto) {
    try {
      await this.productsService.updateQuantity(+id, updateQuantityDto);
      return { message: 'Quantity updated successfully' };
    } catch (err) {
      return { error: err.message || 'Internal Server Error' };
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}

@Controller('popular-products')
export class PopularProductsController {
  constructor(private readonly productsService: ProductsService) { }
  @Get()
  async getProducts(@Query() query: GetPopularProductsDto): Promise<Product[]> {
    return this.productsService.getPopularProducts(query);
  }
}
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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateQuantityDto } from './dto/update-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { Product } from './entities/product.entity';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadXlService } from './uploadProductsXl';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async getProducts(@Query() query: GetProductsDto): Promise<ProductPaginator> {
    return this.productsService.getProducts(query);
  }

  @Get(':slug/:id')
  async getProductBySlug(
    @Param('slug') slug: string,
    @Param('id') id: number
  ): Promise<Product | undefined> {
    try {
      if (!slug || !id) {
        throw new NotFoundException(`Slug or id is not defined`);
      }
      return await this.productsService.getProductBySlug(slug, id);
    } catch (error) {
      throw new NotFoundException(`Error fetching product: ${error.message}`);
    }
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    // console.log('update***', updateProductDto.variation_options.upsert.map((m) => m.options))
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

@Controller('uploadxl-products')
export class UploadProductsXl {
  constructor(private readonly uploadXlService: UploadXlService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProducts(@UploadedFile() file) {
    if (!file) {
      throw new BadRequestException('File not uploaded');
    }
    const buffer = file.buffer; // Accessing the file buffer directly
    console.log('upload')
    await this.uploadXlService.uploadProductsFromExcel(buffer);
    return { message: 'Products uploaded successfully' };
  }
}
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
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto, UpdateQuantityDto } from './dto/update-product.dto'
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto'
import { Product } from './entities/product.entity'
import { GetPopularProductsDto } from './dto/get-popular-products.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadXlService } from './uploadProductsXl'
import { CacheService } from '../helpers/cacheService'

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cacheService: CacheService,
  ) { }

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    // Invalidate cache for related shop
    await this.cacheService.invalidateCacheBySubstring('products')
    return this.productsService.create(createProductDto)
  }

  @Get()
  async getProducts(
    @Query(ValidationPipe) query: GetProductsDto,
  ): Promise<ProductPaginator> {
    return this.productsService.getProducts(query)
  }

  @Get(':slug/:shop_id')
  async getProductBySlug(
    @Param('slug') slug: string,
    @Param('shop_id', ParseIntPipe) shop_id: number, // Ensures shop_id is parsed as an integer
    @Query('dealerId') dealerId?: number,
  ): Promise<Product | undefined> {
    try {
      if (!slug || !shop_id) {
        throw new NotFoundException('Slug or shop_id is missing')
      }
      return await this.productsService.getProductBySlug(
        slug,
        shop_id,
        dealerId,
      )
    } catch (error) {
      throw new NotFoundException(`Error fetching product: ${error.message}`)
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    await this.cacheService.invalidateCacheBySubstring('products')
    return this.productsService.update(+id, updateProductDto)
  }

  @Post(':id')
  async updateQuantity(
    @Param('id') id: string,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    try {
      await this.productsService.updateQuantity(+id, updateQuantityDto)
      return { message: 'Quantity updated successfully' }
    } catch (err) {
      return { error: err.message || 'Internal Server Error' }
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.cacheService.invalidateCacheBySubstring('products')
    return this.productsService.remove(+id)
  }
}

@Controller('popular-products')
export class PopularProductsController {
  constructor(private readonly productsService: ProductsService) { }
  @Get()
  async getProducts(@Query() query: GetPopularProductsDto): Promise<Product[]> {
    return this.productsService.getPopularProducts(query)
  }
}

@Controller('uploadxl-products')
export class UploadProductsXl {
  constructor(
    private readonly uploadXlService: UploadXlService,
    private readonly cacheService: CacheService, // Properly inject the cache service
  ) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProducts(
    @UploadedFile() file,
    @Query('shop_slug') shopSlug: string,
  ) {
    if (!file) {
      throw new BadRequestException('File not uploaded')
    }
    if (!shopSlug) {
      throw new BadRequestException('shop_slug is required')
    }

    const buffer = file.buffer
    await this.uploadXlService.uploadProductsFromExcel(buffer, shopSlug)
    // await this.cacheService.invalidateCacheBySubstring("products");
    return { message: 'Products uploaded successfully' }
  }
}

/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto, CreateSubCategoryDto } from './dto/create-category.dto'
import { GetCategoriesDto, GetSubCategoriesDto } from './dto/get-categories.dto'
import { UpdateCategoryDto, UpdateSubCategoryDto } from './dto/update-category.dto'
import { CacheService } from '../helpers/cacheService'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService, private readonly cacheService: CacheService) { }

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    await this.cacheService.invalidateCacheBySubstring("categories")
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query() query: GetCategoriesDto) {
    return this.categoriesService.getCategories(query);
  }

  @Get(':param')
  findOne(@Param('param') param: string, @Query('language') language: string, @Query('shopId') shopId: number) {
    return this.categoriesService.getCategory(param, language, shopId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    await this.cacheService.invalidateCacheBySubstring("categories")
    return this.categoriesService.update(+id, updateCategoryDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.cacheService.invalidateCacheBySubstring("categories")
    return this.categoriesService.remove(+id)
  }
}


@Controller('subCategories')
export class SubCategoriesController {
  constructor(private readonly categoriesService: CategoriesService, private readonly cacheService: CacheService) { }

  @Post()
  async create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    await this.cacheService.invalidateCacheBySubstring("subCategories")
    return this.categoriesService.createSubCategory(createSubCategoryDto);
  }

  @Get()
  findAll(@Query() query: GetSubCategoriesDto) {
    return this.categoriesService.getSubCategories(query);
  }

  @Get(':param')
  findOne(@Param('param') param: string, @Query('language') language: string, @Query('shopSlug') shopSlug: string) {
    return this.categoriesService.getSubCategory(param, language, shopSlug);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    await this.cacheService.invalidateCacheBySubstring("subCategories")
    return this.categoriesService.updateSubCategory(+id, updateSubCategoryDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.cacheService.invalidateCacheBySubstring("subCategories")
    return this.categoriesService.removeSubCategory(+id)
  }
}

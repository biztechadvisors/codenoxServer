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

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
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
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id)
  }
}


@Controller('subCategories')
export class SubCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
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
  update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    return this.categoriesService.updateSubCategory(+id, updateSubCategoryDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.removeSubCategory(+id)
  }
}

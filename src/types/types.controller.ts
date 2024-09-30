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
import { TypesService } from './types.service'
import { CreateTypeDto } from './dto/create-type.dto'
import { UpdateTypeDto } from './dto/update-type.dto'
import { GetTypesDto } from './dto/get-types.dto'
import { CacheService } from '../helpers/cacheService'

@Controller('types')
export class TypesController {
  constructor(private readonly typesService: TypesService, private readonly cacheService: CacheService) { }

  @Post()
  async create(@Body() createTypeDto: CreateTypeDto) {
    await this.cacheService.invalidateCacheBySubstring('types_')
    return this.typesService.create(createTypeDto);
  }

  @Get()
  findAll(@Query() query: GetTypesDto) {
    return this.typesService.findAll(query);
  }

  @Get(':slug')
  getTypeBySlug(@Param('slug') slug: string) {
    return this.typesService.getTypeBySlug(slug);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTypeDto: UpdateTypeDto) {
    await this.cacheService.invalidateCacheBySubstring('types_')
    return this.typesService.update(+id, updateTypeDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.cacheService.invalidateCacheBySubstring('types_')
    return this.typesService.remove(+id)
  }
}

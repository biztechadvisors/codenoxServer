import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { GetAttributeArgs } from './dto/get-attribute.dto';
import { Attribute } from './entities/attribute.entity';
import { GetAttributesArgs } from './dto/get-attributes.dto';
import { CacheService } from '../helpers/cacheService';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService,
    private readonly cacheService: CacheService
  ) { }

  @Post()
  async create(@Body() createAttributeDto: CreateAttributeDto) {
    await this.cacheService.invalidateCacheBySubstring("attributes")
    return this.attributesService.create(createAttributeDto);
  }

  @Get()
  findAll(@Query() query: GetAttributesArgs) {
    return this.attributesService.findAll(query);
  }

  @Get(':slug')
  async findOne(@Param() param: GetAttributeArgs): Promise<{ message: string } | Attribute | undefined> {
    const attribute = await this.attributesService.findOne(param);
    return attribute;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    await this.cacheService.invalidateCacheBySubstring("attributes")
    return this.attributesService.update(+id, updateAttributeDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<{ message: string; status: boolean }> {
    await this.attributesService.delete(id);
    await this.cacheService.invalidateCacheBySubstring("attributes")
    await this.cacheService.invalidateCacheBySubstring("attributes")
    return { message: 'Attribute deleted successfully', status: true };
  }

}
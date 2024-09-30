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
import { TagsService } from './tags.service'
import { CreateTagDto } from './dto/create-tag.dto'
import { UpdateTagDto } from './dto/update-tag.dto'
import { GetTagsDto, TagPaginator } from './dto/get-tags.dto'
import { CacheService } from '../helpers/cacheService'

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService, private readonly cacheService: CacheService) { }

  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    await this.cacheService.invalidateCacheBySubstring('tags')
    return this.tagsService.create(createTagDto)
  }

  @Get()
  async findAll(@Query() query: GetTagsDto): Promise<TagPaginator> {
    return this.tagsService.findAll(query)
  }

  @Get(':param')
  findOne(@Param('param') param: string, @Query('language') language: string) {
    return this.tagsService.findOne(param, language)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    await this.cacheService.invalidateCacheBySubstring('tags')
    return this.tagsService.update(+id, updateTagDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.cacheService.invalidateCacheBySubstring('tags')
    return this.tagsService.remove(+id)
  }
}

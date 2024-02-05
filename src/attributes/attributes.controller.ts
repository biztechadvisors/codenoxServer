import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { GetAttributeArgs } from './dto/get-attribute.dto';
import { Attribute } from './entities/attribute.entity';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) { }

  @Post()
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributesService.create(createAttributeDto);
  }

  @Get()
  findAll() {
    return this.attributesService.findAll();
  }

  // @Get(':param')
  // findOne(@Param('param') param: string) {
  //   return this.attributesService.findOne(param);
  // }

  @Get(':slug')
  async findOne(@Param() param: GetAttributeArgs): Promise<{ message: string } | Attribute | undefined> {
    const attribute = await this.attributesService.findOne(param);
    return attribute;
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    return this.attributesService.update(+id, updateAttributeDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<{ message: string; status: boolean }> {
    await this.attributesService.delete(id);
    return { message: 'Attribute deleted successfully', status: true };
  }

}
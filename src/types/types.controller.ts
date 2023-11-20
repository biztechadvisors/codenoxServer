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
import { TypesService } from './types.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { GetTypesDto } from './dto/get-types.dto';

@Controller('types')
export class TypesController {
  constructor(private readonly typesService: TypesService) { }

  @Post()
  create(@Body() createTypeDto: CreateTypeDto) {
    // console.log("createTypeDto", createTypeDto)
    return this.typesService.create(createTypeDto);
  }

  @Get()
  findAll(@Query() query: GetTypesDto) {
    console.log("*************************Type******************")
    return this.typesService.getTypes(query);
  }

  @Get(':slug')
  getTypeBySlug(@Param('slug') slug: string) {
    console.log("********************getTypeBySlug******************")
    return this.typesService.getTypeBySlug(slug);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTypeDto: UpdateTypeDto) {
    return this.typesService.update(+id, updateTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typesService.remove(+id);
  }
}

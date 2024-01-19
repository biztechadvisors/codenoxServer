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
} from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { CreateTaxDto, ValidateGstDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { GetTaxesDto } from './dto/get-taxes.dto';

@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  create(@Body() createTaxDto: CreateTaxDto) {
    return this.taxesService.create(createTaxDto);
  }


  @Post('/validate-gst')
  createValidateGST(@Body() validateGstDto:ValidateGstDto) {
    console.log(validateGstDto);
    return this.taxesService.validateGST(validateGstDto.gstNumber);
  }

  @Get()
  findAll() {
    return this.taxesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxesService.findOne(+id);
  }
  @Get(':id/:proId')
  findOnePro(@Param('id') id: string, @Param('proId') proId: string) {
    return this.taxesService.findOnePro(+id, +proId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaxDto: UpdateTaxDto) {
    return this.taxesService.update(+id, updateTaxDto);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taxesService.remove(+id);
  }
}

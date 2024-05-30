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
  NotFoundException,
} from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { CreateTaxDto, ValidateGstDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';


@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) { }

  @Post()
  create(@Body() createTaxDto: CreateTaxDto) {
    return this.taxesService.create(createTaxDto);
  }

  @Post('/validate-gst')
  createValidateGST(@Body() validateGstDto: ValidateGstDto) {
    return this.taxesService.validateGST(validateGstDto.gstNumber);
  }

  @Get()
  async findAll(@Query('shopId') shopId: number) {
    if (!shopId) {
      throw new NotFoundException('Shop ID is required');
    }
    return await this.taxesService.findAllByShopId(shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxesService.findOne(+id);
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

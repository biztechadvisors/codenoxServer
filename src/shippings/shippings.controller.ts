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
import { ShippingsService } from './shippings.service'
import { CreateShippingDto } from './dto/create-shipping.dto'
import { UpdateShippingDto } from './dto/update-shipping.dto'
import { GetShippingsDto } from './dto/get-shippings.dto'

@Controller('shippings')
export class ShippingsController {
  constructor(private readonly shippingsService: ShippingsService) {}

  @Post()
  create(@Body() createShippingDto: CreateShippingDto) {
    return this.shippingsService.create(createShippingDto)
  }

  @Get()
<<<<<<< HEAD
  findAll() {
    return this.shippingsService.getShippings();
=======
  findAll(@Query() query: GetShippingsDto) {
    return this.shippingsService.getShippings(query)
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shippingsService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateShippingDto: UpdateShippingDto,
  ) {
    return this.shippingsService.update(+id, updateShippingDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shippingsService.remove(+id)
  }
}

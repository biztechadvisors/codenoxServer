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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CacheService } from '../helpers/cacheService';

@Controller('address')
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
    private readonly cacheService: CacheService
  ) { }

  @Post()
  async createAddress(@Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  addresses(@Query('userId') userId: number) {
    return this.addressesService.findAll(userId);
  }

  @Get(':id')
  async address(@Param('id') id: string) {
    return this.addressesService.findOne(+id);
  }

  @Put(':id')
  async updateAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    await this.cacheService.invalidateCacheBySubstring("address")
    return this.addressesService.update(+id, updateAddressDto);
  }

  @Delete(':id')
  async deleteAddress(@Param('id') id: string) {
    return this.addressesService.remove(+id);
  }
}

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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CacheService } from '../helpers/cacheService';

@Controller('address')
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
    private readonly cacheService: CacheService,
  ) { }

  @Post()
  async createAddress(@Body() createAddressDto: CreateAddressDto) {
    await this.invalidateAddressCache(createAddressDto.customer_id);
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  addresses(@Query('userId') userId: number) {
    return this.addressesService.findAll(userId);
  }

  @Get(':id')
  async address(@Param('id') id: number) {
    return this.addressesService.findOne(id);
  }

  @Put(':id')
  async updateAddress(
    @Param('id') id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    await this.invalidateAddressCache(updateAddressDto.customer_id, id);
    return this.addressesService.update(id, updateAddressDto);
  }

  @Delete(':id')
  async deleteAddress(@Param('id') id: number) {
    const address = await this.addressesService.findOne(id);
    if (address) {
      await this.invalidateAddressCache(address.customer.id, id);
    }
    return this.addressesService.remove(id);
  }

  // Consolidated cache invalidation logic for better maintainability
  private async invalidateAddressCache(userId: number, addressId?: number) {
    if (addressId) {
      await this.cacheService.invalidateCacheBySubstring(`address:id:${addressId}`);
    }
    await this.cacheService.invalidateCacheBySubstring(`addresses:userId:${userId}`);
  }
}

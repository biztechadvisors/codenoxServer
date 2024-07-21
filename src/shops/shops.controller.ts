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
  ParseIntPipe,
} from '@nestjs/common'
import { ShopsService } from './shops.service'
import { ApproveShopDto, CreateShopDto } from './dto/create-shop.dto'
import { UpdateShopDto } from './dto/update-shop.dto'
import { GetShopsDto, ShopPaginator } from './dto/get-shops.dto'
import { Shop } from './entities/shop.entity'
import { GetStaffsDto } from './dto/get-staffs.dto'
import { UserPaginator } from 'src/users/dto/get-users.dto'
// import { AddStaffDto } from 'src/users/dto/add-staff.dto'

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) { }

  @Post()
  async create(@Body() createShopDto: CreateShopDto): Promise<Shop> {
    return this.shopsService.create(createShopDto);
  }

  @Get()
  async getShops(@Query() query: GetShopsDto): Promise<ShopPaginator> {
    return this.shopsService.getShops(query);
  }

  @Get(':slug')
  async getShop(@Param('slug') slug: string): Promise<Shop | null> {
    return this.shopsService.getShop(slug);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateShopDto: UpdateShopDto): Promise<Shop> {
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.shopsService.remove(id);
  }

  @Post('approve/:id')
  async approve(@Param('id', ParseIntPipe) id: number): Promise<Shop> {
    return this.shopsService.changeShopStatus(id, true);
  }

  @Post('disapprove/:id')
  async disapprove(@Param('id', ParseIntPipe) id: number): Promise<Shop> {
    return this.shopsService.changeShopStatus(id, false);
  }
}

@Controller('staffs')
export class StaffsController {
  constructor(private readonly shopsService: ShopsService) { }

  @Get()
  async getStaffs(@Query() query: GetStaffsDto): Promise<UserPaginator> {
    return this.shopsService.getStaffs(query);
  }

}

@Controller('approve-shop')
export class ApproveShopController {
  constructor(private readonly shopsService: ShopsService) { }

  @Post()
  async approveShop(@Body() approveShopDto: ApproveShopDto): Promise<Shop> {
    return this.shopsService.approveShop(approveShopDto);
  }
}

@Controller('disapprove-shop')
export class DisapproveShopController {
  constructor(private readonly shopsService: ShopsService) { }

  @Post()
  async disapproveShop(@Body('id', ParseIntPipe) id: number): Promise<Shop> {
    return this.shopsService.disapproveShop(id);
  }
}

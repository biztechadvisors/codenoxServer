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
import { GetStaffsDto } from './dto/get-staffs.dto'
import { UserPaginator } from 'src/users/dto/get-users.dto'
import { Shop } from './entities/shop.entity'
// import { AddStaffDto } from 'src/users/dto/add-staff.dto'

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) { }

  @Post()
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopsService.create(createShopDto)
  }

  @Get()
  async getShops(@Query() query: GetShopsDto): Promise<ShopPaginator> {
    return this.shopsService.getShops(query);
    // console.log("result shopsssssss", result)
    // return result
  }

  @Get(':slug')
  async getShop(@Param('slug') slug: string): Promise<GetShopsDto | null> {
    return this.shopsService.getShop(slug);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateShopDto: UpdateShopDto) {
    return this.shopsService.update(+id, updateShopDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopsService.remove(+id)
  }

  @Post('approve/:id')
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.changeShopStatus(id, true);
  }

  @Post('disapprove/:id')
  async disapprove(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.changeShopStatus(id, false);
  }
}

@Controller('staffs')
export class StaffsController {
  constructor(private readonly shopsService: ShopsService) { }

  @Post()
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopsService.create(createShopDto)
  }

  @Get()
  async getStaffs(@Query() query: GetStaffsDto): Promise<UserPaginator> {
    return this.shopsService.getStaffs(query)
  }

  @Get(':slug')
  async getShop(@Param('slug') slug: string) {
    return this.shopsService.getShop(slug)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopsService.update(+id, updateShopDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopsService.remove(+id)
  }
}

@Controller('disapprove-shop')
export class DisapproveShopController {
  constructor(private shopsService: ShopsService) { }
  @Post()
  async disapproveShop(@Body('id') id) {
    return this.shopsService.disapproveShop(id)
  }
}

@Controller('approve-shop')
export class ApproveShopController {
  constructor(private shopsService: ShopsService) { }
  @Post()
  async approveShop(@Body() approveShopDto: ApproveShopDto): Promise<Shop> {
    return this.shopsService.approveShop(approveShopDto);
  }
}
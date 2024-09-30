/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import { WishlistsService } from './wishlists.service';
import { CacheService } from '../helpers/cacheService';

@Controller('wishlists')
export class WishlistsController {
  constructor(private wishlistService: WishlistsService, private readonly cacheService: CacheService) { }

  @Get()
  findAll(@Query() query: GetWishlistDto, @Query('userId') userId?: number) {
    return this.wishlistService.findAllWishlists(query, userId);
  }

  // Get single
  @Get(':id')
  find(@Param('id') id: string) {
    return this.wishlistService.findWishlist(+id);
  }

  // create
  @Post()
  async create(@Body() createWishlistDto: CreateWishlistDto) {
    await this.cacheService.invalidateCacheBySubstring('wishlists_')
    return this.wishlistService.create(createWishlistDto);
  }

  // update
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    await this.cacheService.invalidateCacheBySubstring('wishlists_')
    await this.cacheService.invalidateCacheBySubstring(`wishlist_${id}`)
    return this.wishlistService.update(+id, updateWishlistDto);
  }

  // delete
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.cacheService.invalidateCacheBySubstring('wishlists_')
    await this.cacheService.invalidateCacheBySubstring(`wishlist_${id}`)
    return this.wishlistService.delete(+id);
  }

  // wishlists/toggle
  @Post('/toggle')
  toggle(@Body() CreateWishlistDto: CreateWishlistDto) {
    return this.wishlistService.toggle(CreateWishlistDto);
  }
  // /in_wishlist/{product_id}
  @Get('/in_wishlist/:product_id')
  inWishlist(@Param('product_id') id: string) {
    return this.wishlistService.isInWishlist(+id);
  }
}

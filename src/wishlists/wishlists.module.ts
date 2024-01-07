/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MyWishlistsController } from './my-wishlists.controller';
import { MyWishlistService } from './my-wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist,Product,User])],
  controllers: [WishlistsController, MyWishlistsController],
  providers: [WishlistsService, MyWishlistService],
})
export class WishlistsModule { }

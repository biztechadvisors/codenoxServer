import { Module } from '@nestjs/common';
import { MyWishlistsController } from './my-wishlists.controller';
import { MyWishlistService } from './my-wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist])],
  controllers: [WishlistsController, MyWishlistsController],
  providers: [WishlistsService, MyWishlistService],
})
export class WishlistsModule { }

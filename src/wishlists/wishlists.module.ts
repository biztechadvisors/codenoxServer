import { Module } from '@nestjs/common'
import { MyWishlistsController } from './my-wishlists.controller'
import { MyWishlistService } from './my-wishlists.service'
import { WishlistsController } from './wishlists.controller'
import { WishlistsService } from './wishlists.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Wishlist } from './entities/wishlist.entity'
import { WishlistRepository } from './wishlists.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([WishlistRepository]),
    TypeOrmModule.forFeature([Wishlist]),
  ],
  controllers: [WishlistsController, MyWishlistsController],
  providers: [WishlistsService, MyWishlistService, WishlistRepository],
})
export class WishlistsModule {}

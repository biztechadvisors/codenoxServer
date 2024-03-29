/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger';
import { Wishlist } from '../entities/wishlist.entity';

export class CreateWishlistDto extends PickType(Wishlist, ['product_id','user_id','product','user']) {}

/* eslint-disable prettier/prettier */
import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';

@CustomRepository(Wishlist)
export class WishlistRepository extends Repository<Wishlist> {}

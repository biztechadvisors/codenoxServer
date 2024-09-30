import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import { WishlistsService } from './wishlists.service';
import { CacheService } from '../helpers/cacheService';
export declare class WishlistsController {
    private wishlistService;
    private readonly cacheService;
    constructor(wishlistService: WishlistsService, cacheService: CacheService);
    findAll(query: GetWishlistDto, userId?: number): Promise<unknown>;
    find(id: string): Promise<import("./entities/wishlist.entity").Wishlist>;
    create(createWishlistDto: CreateWishlistDto): Promise<void>;
    update(id: string, updateWishlistDto: UpdateWishlistDto): Promise<void>;
    delete(id: string): Promise<import("./entities/wishlist.entity").Wishlist>;
    toggle(CreateWishlistDto: CreateWishlistDto): any;
    inWishlist(id: string): any;
}

import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { CacheService } from '../helpers/cacheService';
export declare class WishlistsService {
    private readonly wishlistRepository;
    private readonly productRepository;
    private readonly cacheManager;
    private readonly cacheService;
    constructor(wishlistRepository: Repository<Wishlist>, productRepository: Repository<Product>, cacheManager: Cache, cacheService: CacheService);
    findAllWishlists({ limit, page, search }: GetWishlistDto, userId?: number): Promise<unknown>;
    findWishlist(id: number): Promise<Wishlist>;
    create(createWishlistDto: CreateWishlistDto): Promise<void>;
    update(id: number, updateWishlistDto: UpdateWishlistDto): Promise<void>;
    delete(id: number): Promise<Wishlist>;
    isInWishlist(product_id: number): any;
    toggle({ product_id }: CreateWishlistDto): any;
}

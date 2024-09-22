import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import { Product } from '../products/entities/product.entity';
import { Repository } from 'typeorm';
export declare class MyWishlistService {
    private readonly wishlistRepository;
    private readonly productRepository;
    constructor(wishlistRepository: Repository<Wishlist>, productRepository: Repository<Product>);
    findAMyWishlists({ limit, page, search }: GetWishlistDto): Promise<{
        count: number;
        current_page: number;
        firstItem: number;
        lastItem: number;
        last_page: number;
        per_page: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
        next_page_url: string;
        prev_page_url: string;
        data: Wishlist[];
    }>;
    findAMyWishlist(id: number): Promise<Wishlist>;
    create(createWishlistDto: CreateWishlistDto): Promise<void>;
    update(id: number, updateWishlistDto: UpdateWishlistDto): Promise<void>;
    delete(id: number): Promise<Wishlist>;
}

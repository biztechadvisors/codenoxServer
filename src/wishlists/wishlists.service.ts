/* eslint-disable prettier/prettier */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import { Product } from '../products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) { }

  async findAllWishlists({ limit = 30, page = 1, search }: GetWishlistDto, userId?: number) {
    const cacheKey = `wishlists_${userId || 'all'}_${page}_${limit}_${search || 'all'}`;

    // Try to get cached data
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const startIndex = (page - 1) * limit;
    const findOptions: FindManyOptions<Wishlist> = {
      skip: startIndex,
      take: limit,
      relations: ['product'], // Include the 'product' relation
      where: userId ? { user: { id: userId } } : {},
    };

    // Fetch the data
    let data = await this.wishlistRepository.find(findOptions);

    // Apply search filter if necessary
    if (search) {
      data = data.filter(item =>
        item.product.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const results = data.slice(startIndex, startIndex + limit);
    const url = `/wishlists?with=shop&orderBy=created_at&sortedBy=desc`;
    const paginatedData = {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };

    // Cache the data
    await this.cacheManager.set(cacheKey, paginatedData, 60); // Cache for 1 hour

    return paginatedData;
  }

  async findWishlist(id: number): Promise<Wishlist> {
    const cacheKey = `wishlist_${id}`;

    // Try to get cached data
    const cachedWishlist = await this.cacheManager.get<Wishlist>(cacheKey);
    if (cachedWishlist) {
      return cachedWishlist;
    }

    // Fetch from database if not in cache
    const wishlist = await this.wishlistRepository.findOne({
      where: { id: id },
      relations: ['product'],
    });

    if (!wishlist) {
      throw new NotFoundException(`Wishlist with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheManager.set(cacheKey, wishlist, 60); // Cache for 1 hour

    return wishlist;
  }

  async create(createWishlistDto: CreateWishlistDto) {
    try {
      const wishlist = new Wishlist()
      wishlist.product_id = createWishlistDto.product_id
      wishlist.product = createWishlistDto.product
      wishlist.user = createWishlistDto.user
      wishlist.user_id = createWishlistDto.user_id
      await this.wishlistRepository.save(wishlist)

    } catch (err) {
      console.log('Error' + err)
    }
    // return this.wishlistRepository[0];
  }

  async update(id: number, updateWishlistDto: UpdateWishlistDto) {
    if (id) {
      const existingTaxes = await this.wishlistRepository.findOne({
        where: { id: id }
      })

      if (!existingTaxes) {
        throw new NotFoundException('Question not found');
      }
      existingTaxes.product = updateWishlistDto.product
      existingTaxes.product_id = updateWishlistDto.product_id
      existingTaxes.user = updateWishlistDto.user
      existingTaxes.user_id = updateWishlistDto.user_id

      await this.wishlistRepository.save(existingTaxes)
    }
    // return this.wishlistRepository[0];
  }

  async delete(id: number) {
    const existingWishlist = await this.wishlistRepository.findOne({
      where: { id: id }
    })

    if (!existingWishlist) {
      throw new NotFoundException('Question not found');
    }
    return this.wishlistRepository.remove(existingWishlist);
  }

  isInWishlist(product_id: number) {

    const product = this.productRepository.find({ where: { id: product_id } });
    return product[0]?.in_wishlist;
  }

  toggle({ product_id }: CreateWishlistDto) {
    const product = this.productRepository.find({ where: { id: product_id } });

    product[0].in_wishlist = !product[0]?.in_wishlist;

    return product[0].in_wishlist;
  }
}

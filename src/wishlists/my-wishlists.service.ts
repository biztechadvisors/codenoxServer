/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import { Product } from '../products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

const options = {
  keys: ['answer'],
  threshold: 0.3,
};

@Injectable()
export class MyWishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async findAMyWishlists({ limit, page, search }: GetWishlistDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Define options for this.wishlistRepository.find
    const findOptions: FindManyOptions<Wishlist> = {
      skip: startIndex,
      take: limit,
      relations: ['product'], // Include the 'product' relation
    };

    // Await the result of this.wishlistRepository.find
    let data = await this.wishlistRepository.find(findOptions);

    const results = data.slice(startIndex, endIndex);
    const withParam = 'shop'; // or pass it as a variable if needed
    const orderBy = 'created_at'; // or pass it as a variable if needed
    const sortedBy = 'desc'; // or pass it as a variable if needed

    const url = `/wishlists?${withParam ? `with=${withParam}` : ''}${orderBy ? `&orderBy=${orderBy}` : ''}${sortedBy ? `&sortedBy=${sortedBy}` : ''}`.replace(/\?&/, '?').replace(/&$/, '');

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };

  }

  findAMyWishlist(id: number) {
    return this.wishlistRepository.findOne({ where: { id: id }, relations: ['product'] });
  }

  // create(createWishlistDto: CreateWishlistDto) {
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
  // }

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
}

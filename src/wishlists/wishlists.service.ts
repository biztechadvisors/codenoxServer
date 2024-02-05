/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import wishlistsJSON from '@db/wishlists.json';
import productsJson from '@db/products.json';
import { Product } from '../products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';

const wishlists = plainToClass(Wishlist, wishlistsJSON);
const products = plainToClass(Product, productsJson);
const options = {
  keys: ['answer'],
  threshold: 0.3,
};
const fuse = new Fuse(wishlists, options);

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

  ) { }
  // private wishlist: Wishlist[] = wishlists;
  // private products: any = products;

  async findAllWishlists({ limit, page, search }: GetWishlistDto) {
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

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');

        // Assuming fuse.search is asynchronous, you need to await it
        const searchResults = await fuse.search(value);

        // Assuming searchResults is an array of items, you can map it
        const searchItems = searchResults?.map(({ item }) => item);

        // Concatenate the search results with the existing data
        data = data.concat(searchItems);
      }
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/wishlists?with=shop&orderBy=created_at&sortedBy=desc`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }


  findWishlist(id: number) {
    return this.wishlistRepository.findOne({ where: { id: id }, relations: ['product'] });
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

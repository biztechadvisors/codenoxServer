import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import Fuse from 'fuse.js'
import { paginate } from 'src/common/pagination/paginate'
import { Wishlist } from './entities/wishlist.entity'
import { GetWishlistDto } from './dto/get-wishlists.dto'
import { CreateWishlistDto } from './dto/create-wishlists.dto'
import { UpdateWishlistDto } from './dto/update-wishlists.dto'
import wishlistsJSON from '@db/wishlists.json'
import productsJson from '@db/products.json'
import { Product } from '../products/entities/product.entity'
import { WishlistRepository } from './wishlists.repository'
import { InjectRepository } from '@nestjs/typeorm'

const wishlists = plainToClass(Wishlist, wishlistsJSON)
const products = plainToClass(Product, productsJson)
const options = {
  keys: ['answer'],
  threshold: 0.3,
}
const fuse = new Fuse(wishlists, options)

@Injectable()
export class WishlistsService {
  private wishlist: Wishlist[] = wishlists
  private products: any = products
  constructor(
    @InjectRepository(WishlistRepository)
    private readonly wishlistRepository: WishlistRepository,
  ) {}
  // constructor(private wishlistRepository: WishlistRepository) {}

  async findAllWishlists({ limit, page, search }: GetWishlistDto) {
    if (!page) page = 1
    if (!limit) limit = 30
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let data: Wishlist[] = this.wishlist

    if (search) {
      const parseSearchParams = search.split(';')
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':')
        data = fuse.search(value)?.map(({ item }) => item)
      }
    }

    const results = data.slice(startIndex, endIndex)
    const url = `/wishlists?with=shop&orderBy=created_at&sortedBy=desc`
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    }
  }

  findWishlist(id: number) {
    return this.wishlist.find((p) => p.id === id)
  }

  async create(createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    const wishlist = new Wishlist()
    wishlist.user_id = createWishlistDto.user_id
    console.log('first', wishlist.user_id)
    wishlist.product_id = createWishlistDto.product_id
    console.log('first', wishlist.product_id)
    wishlist.product = createWishlistDto.product
    console.log('first', wishlist.product)
    wishlist.created_at = createWishlistDto.created_at
    console.log('first', wishlist.created_at)
    wishlist.updated_at = createWishlistDto.updated_at
    console.log('first', wishlist.updated_at)

    await this.wishlistRepository.save(wishlist)

    console.log(wishlist)

    return wishlist
  }

  update(_id: number, _updateWishlistDto: UpdateWishlistDto) {
    return this.wishlist[0]
  }

  delete(_id: number) {
    return this.wishlist[0]
  }

  isInWishlist(product_id: number) {
    const product = this.products.find((p) => p.id === Number(product_id))

    return product?.in_wishlist
  }

  toggle({ product_id }: CreateWishlistDto) {
    const product = this.products.find((p) => p.id === Number(product_id))

    product.in_wishlist = !product?.in_wishlist

    return product.in_wishlist
  }
}

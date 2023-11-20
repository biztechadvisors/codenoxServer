/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateShopDto } from './dto/create-shop.dto'
import { UpdateShopDto } from './dto/update-shop.dto'
import { Shop } from './entities/shop.entity'
import shopsJson from '@db/shops.json'
import Fuse from 'fuse.js'
import { GetShopsDto } from './dto/get-shops.dto'
import { paginate } from 'src/common/pagination/paginate'
import { GetStaffsDto } from './dto/get-staffs.dto'
import { BalanceRepository, PaymentInfoRepository, ShopRepository, ShopSettingsRepository } from './shops.repository'
import { InjectRepository } from '@nestjs/typeorm'
import { convertToSlug } from 'src/helpers'

const shops = plainToClass(Shop, shopsJson)
const options = {
  keys: ['name', 'type.slug', 'is_active'],
  threshold: 0.3,
}
const fuse = new Fuse(shops, options)

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(ShopRepository)
    private shopRepository: ShopRepository,
    @InjectRepository(BalanceRepository)
    private balanceRepository: BalanceRepository,
    @InjectRepository(ShopSettingsRepository)
    private shopsettingRepository: ShopSettingsRepository,
    @InjectRepository(PaymentInfoRepository)
    private paymentInfoRepository: PaymentInfoRepository,
  ) {}
  private shops: Shop[] = []


  async convertToSlug(text) {
    return await convertToSlug(text)
  }

  async create(createShopDto: CreateShopDto): Promise<Shop> {
      const newShop = this.shopRepository.create(createShopDto);
  

    //   if (createShopDto.balance) {
    //     const newBalance = this.balanceRepository.create(createShopDto.balance);
    //     const savedBalance = await this.balanceRepository.save(newBalance);
    
    //     if (savedBalance && createShopDto.balance.payment_info) {
    //       const newPaymentInfo = this.paymentInfoRepository.create(createShopDto.balance.payment_info);
    //       const savedPaymentInfo = await this.paymentInfoRepository.save(newPaymentInfo);
    //       if (savedPaymentInfo) {
    //         savedBalance.payment_info = savedPaymentInfo;
    //         await this.balanceRepository.save(savedBalance);  // Update the balance with the new payment_info
    //       }
    //     }
    // console.log("first", newShop.balance)
    //     newShop.balance = savedBalance;
    //   }
    
    //   // ... rest of your code
    //     newShop.name = createShopDto.name;
    //     newShop.slug = await this.convertToSlug(createShopDto.name);
    
    //   const savedShop = await this.shopRepository.save(newShop);
    
    //   return savedShop;
    // }
    


  //   const newShop = new Shop();
    
    if (createShopDto.balance) {
      // newBalance.admin_commission_rate = createBalanceDto.admin_commission_rate
      // newBalance.total_earnings = createBalanceDto.total_earnings
      // newBalance.withdrawn_amount = createBalanceDto.withdrawn_amount
      // newBalance.current_balance = createBalanceDto.current_balance

      //    this.balanceRepository.create(newBalance)
      console.log("third", createShopDto.balance)
      const newBalance = this.balanceRepository.create(createShopDto.balance);
      console.log("forth", newBalance)
      console.log("fifth", await this.balanceRepository.save(newBalance))
      // newShop.balance = await this.balanceRepository.save(newBalance);
    }

   console.log("error")
    if (createShopDto.balance.payment_info) {
      console.log("working", createShopDto.balance.payment_info)
      const newPaymentInfo = this.paymentInfoRepository.create(createShopDto.balance.payment_info);
      console.log("first", newPaymentInfo)
      console.log("second", await this.paymentInfoRepository.save(newPaymentInfo))
      newShop.balance.payment_info = await this.paymentInfoRepository.save(newPaymentInfo);
     
      console.log("second", newShop.balance.payment_info)
    }


   

    console.log("CreateShop-Data",createShopDto)
    // const newShop = new Shop();
    newShop.name = createShopDto.name;
    newShop.slug = await this.convertToSlug(createShopDto.name);
    // newShop.address = createShopDto.address;
    newShop.description = createShopDto.description;
    // newShop.cover_image = createShopDto.cover_image;
    // newShop.logo = createShopDto.logo;
    // newShop.settings = createShopDto.settings;
    newShop.balance = createShopDto.balance;
    // newShop.categories = createShopDto.categories;
    console.log("first", newShop)
   console.log("first+++++++++++", await this.shopRepository.save(newShop))

    return newShop;
    // return this.shops[0]
  }


  getShops({ search, limit, page }: GetShopsDto) {
    if (!page) page = 1

    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let data: Shop[] = this.shops
    if (search) {
      const parseSearchParams = search.split(';')
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':')
        // data = data.filter((item) => item[key] === value);
        data = fuse.search(value)?.map(({ item }) => item)
      }
    }
    // if (text?.replace(/%/g, '')) {
    //   data = fuse.search(text)?.map(({ item }) => item);
    // }
    const results = data.slice(startIndex, endIndex)
    const url = `/shops?search=${search}&limit=${limit}`

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    }
  }


  getStaffs({ shop_id, limit, page }: GetStaffsDto) {
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let staffs: Shop['staffs'] = []
    if (shop_id) {
      staffs = this.shops.find((p) => p.id === Number(shop_id))?.staffs ?? []
    }
    const results = staffs?.slice(startIndex, endIndex)
    const url = `/staffs?limit=${limit}`

    return {
      data: results,
      ...paginate(staffs?.length, page, limit, results?.length, url),
    }
  }

  getShop(slug: string): Shop {
    return this.shops.find((p) => p.slug === slug)
  }

  update(id: number, updateShopDto: UpdateShopDto) {
    return this.shops[0]
  }

  approve(id: number) {
    return `This action removes a #${id} shop`
  }

  remove(id: number) {
    return `This action removes a #${id} shop`
  }

  disapproveShop(id: number) {
    const shop = this.shops.find((s) => s.id === Number(id))
    shop.is_active = false

    return shop
  }

  approveShop(id: number) {
    const shop = this.shops.find((s) => s.id === Number(id))
    shop.is_active = true

    return shop
  }
}

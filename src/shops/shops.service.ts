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
import { AddressRepository, BalanceRepository, LocationRepository, PaymentInfoRepository, ShopRepository, ShopSettingsRepository, ShopShocialRepository } from './shops.repository'
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
    @InjectRepository(AddressRepository)
    private addressRepository: AddressRepository,
    @InjectRepository(ShopShocialRepository)
    private shopSocialRepository: ShopShocialRepository,
    @InjectRepository(LocationRepository)
    private locationRepository: LocationRepository,
  ) {}
  private shops: Shop[] = []


  async convertToSlug(text) {
    return await convertToSlug(text)
  }

  async create(createShopDto: CreateShopDto): Promise<Shop> {

      let value: any
      let value1: any
      let value2: any
      const newShop = new Shop()
      const newshopss = this.shopRepository.create(createShopDto)

    if (createShopDto.balance) {

       const newBalance = this.balanceRepository.create(createShopDto.balance);
       const balanceId = await this.balanceRepository.save(newBalance);
       value = balanceId.id

        if (createShopDto.balance.payment_info) {

          const newPaymentInfo = this.paymentInfoRepository.create(createShopDto.balance.payment_info);
          newshopss.balance.payment_info = await this.paymentInfoRepository.save(newPaymentInfo);
         
        }
    
    }

    if(createShopDto.address) {

      const newAddress = this.addressRepository.create(createShopDto.address)
      const addressId = await this.addressRepository.save(newAddress);
      value1 = addressId
    }

    if(createShopDto.settings) {

      if(createShopDto.settings.socials){
        const newSocial = this.shopSocialRepository.create(createShopDto.settings.socials)
        newshopss.settings.socials = await this.shopSocialRepository.save(newSocial)
        console.log("NewSocial", newSocial)
        console.log("final submmission", newshopss.settings.socials)
      }
       if(createShopDto.settings.location){
        const newLocation = this.locationRepository.create(createShopDto.settings.location)
        newshopss.settings.location = await this.locationRepository.save(newLocation)
        console.log("NewSocial", newLocation)
        console.log("final submmission", newshopss.settings.location)
       }

       const newSettings = this.shopsettingRepository.create(createShopDto.settings)
       console.log("second", newSettings)
       const settingId = await this.shopsettingRepository.save(newSettings)
       value2 = settingId.id;
       console.log("value2", value2)
       console.log("settingId", settingId, "createShopDto&settings", createShopDto.settings)
      
    }

    newShop.name = createShopDto.name;
    newShop.slug = await this.convertToSlug(createShopDto.name);
    newShop.balance = value
    newShop.description = createShopDto.description;
    newShop.cover_image = createShopDto.cover_image
    newShop.logo = createShopDto.logo
    newShop.address = value1
    newShop.settings = value2
    console.log("create", createShopDto)
  
  return await this.shopRepository.save(newShop)

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

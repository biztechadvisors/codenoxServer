/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common'
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
import { Balance } from './entities/balance.entity'
import { ShopSettings } from './entities/shopSettings.entity'
import { Setting, ShopSocials } from 'src/settings/entities/setting.entity'
import { Social } from 'src/users/entities/profile.entity'



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
      let saved: any
      let locationId:any
     

      const newShop = new Shop()
      const newBalance = new Balance()
      const newSetting = new ShopSettings()

      const newshopss = this.shopRepository.create(createShopDto)

 try{
    if(createShopDto.address) {

      const newAddress = this.addressRepository.create(createShopDto.address)
      const addressId = await this.addressRepository.save(newAddress);
      value1 = addressId
    }

    if(createShopDto.settings) {

       const newSettings = this.shopsettingRepository.create(createShopDto.settings)
       console.log("newSettings", newSettings.id)

      if(createShopDto.settings.socials){
        console.log("createShopDto", createShopDto.settings.socials)
        const socials: ShopSocials[] = [];

    for(const social of createShopDto.settings.socials) {

        const newSocial = this.shopSocialRepository.create(social)
        console.log("newsocial", newSocial)
        const  socialId = await this.shopSocialRepository.save(newSocial)
        console.log("newShopSocial", socialId)
       
        socials.push(socialId);
        
        console.log("dekjoo", newSetting.socials )
    }
       newSetting.socials = socials
    console.log("All socials saved with ids: ", socials);
}
      
      console.log("chalo")
       if(createShopDto.settings.location){
        console.log("createShopDto Setting", createShopDto.settings.location)
        const newLocation = this.locationRepository.create(createShopDto.settings.location)
        console.log("newLocation", newLocation)
        locationId = await this.locationRepository.save(newLocation)
         console.log("newShop Location", locationId)
       }
       console.log("working good", newSetting.socials)
       
       newSetting.contact = createShopDto.settings.contact
       newSetting.website = createShopDto.settings.website
      //  newSetting.socials = socialIds
       newSetting.location = locationId.id

       const settingId = await this.shopsettingRepository.save(newSetting)
       console.log("settingId",settingId)
       const socialIds = settingId.socials.map((social) => social.id);
      
       console.log("Array Id", socialIds)
       value2 = settingId.id;
       console.log("value2", value2)
    }
    

    newShop.name = createShopDto.name;
    newShop.slug = await this.convertToSlug(createShopDto.name);
    newShop.description = createShopDto.description;
    newShop.cover_image = createShopDto.cover_image
    newShop.logo = createShopDto.logo
    newShop.address = value1
    newShop.settings = value2

  
    const shop = await this.shopRepository.save(newShop)
    

    if (createShopDto.balance) {


      if (createShopDto.balance.payment_info) {

        const newPaymentInfo = this.paymentInfoRepository.create(createShopDto.balance.payment_info);
         saved = await this.paymentInfoRepository.save(newPaymentInfo);
      }

      newBalance.admin_commission_rate = createShopDto.balance.admin_commission_rate
      newBalance.current_balance= createShopDto.balance.current_balance
      newBalance.payment_info = saved.id
      newBalance.total_earnings =createShopDto.balance.total_earnings
      newBalance.withdrawn_amount= createShopDto.balance.withdrawn_amount
      newBalance.shop = shop
    
      const balanceId = await this.balanceRepository.save(newBalance);
      value = balanceId.id
      console.log(value)
  }
    

     newShop.balance = value
     await this.shopRepository.save(newShop) 

    return shop

} catch(error){
  console.error(error)
}

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

  async update(id: number, updateShopDto: UpdateShopDto): Promise<Shop> {
  // console.log("id and data", id, updateShopDto)
   
    const existingShop = await this.shopRepository.findOne({ 
      where: { id: id }, 
      relations: ["balance", "address", "settings"] 
    });
    // console.log("existingShop", existingShop)
    if (existingShop) {
      // Update existing shop
      existingShop.name = updateShopDto.name;
      existingShop.slug = await this.convertToSlug(updateShopDto.name);
      existingShop.description = updateShopDto.description;
      existingShop.cover_image = updateShopDto.cover_image;
      existingShop.logo = updateShopDto.logo;
   

      if (updateShopDto.address) {
        const updatedAddress = this.addressRepository.create(updateShopDto.address);
        existingShop.address = await this.addressRepository.save({ ...existingShop.address, ...updatedAddress });
        console.log("address", existingShop.address)
      }
            
      
      if (updateShopDto.settings) {

        const setting = await this.shopsettingRepository.findOne({
          where: {id: existingShop.settings.id},
          relations: ["socials", "location"]
        });
         console.log("settingsssssss", setting)

        if(setting) {
          
          try {

          const updatedSettings = this.shopsettingRepository.create(updateShopDto.settings);
          console.log("setting_____________", updatedSettings)
          existingShop.settings = setting
          console.log("+++++++++++++++++++++++", existingShop.settings, setting)
          existingShop.settings = await this.shopsettingRepository.save({ ...existingShop.settings, ...updatedSettings });
          console.log("setting++++++++++++++++++++++++++", existingShop.settings)

        } catch(error) {
          console.log("ShopSetting Data Already Up to Date.")
        }
          if (updateShopDto.settings.socials) {
            const socials: ShopSocials[] = [];
            console.log("socail+++++++++")
            // const existingSocials = await this.shopSocialRepository.findAll({
            //   where: {
            //     id: setting.socials,
            //   },
            // });
           
            for (const updateSocial of updateShopDto.settings.socials) {
              // Find existing social object by id (if any)
              const existingSocial = setting.socials.find(
                (social) => social.id === updateSocial.id
              );
                 console.log("newdata", existingSocial)
              // Update existing social or create new one
              if (existingSocial) {
                console.log("existingSocial************", existingSocial)
                // existingSocial.update(updateSocial);
               const up = await this.shopSocialRepository.save(existingSocial);
                console.log("updated", up)
              } else {
                // Create new social object
                const newSocial = this.shopSocialRepository.create({ ...updateSocial });
                console.log("newSocial???????????", newSocial)
                const socialId = await this.shopSocialRepository.save(newSocial);
                console.log("socialID>>>>>>>>>>>>>>>>>>>>>", socialId)
                socials.push(socialId);
                console.log("valuessssss", socials)
                console.log("result", existingShop.settings.socials)
              }
            }
            
            // const Social = await this.shopSocialRepository.findOne({where: {id: existingShop.settings.socials.id}});
            //    console.log("social", Social)

            // if(Social){

            //   const updatedSocials = this.shopSocialRepository.create(updateShopDto.settings.socials);
            //   existingShop.settings.socials = Social[]
            //   existingShop.settings.socials = await this.shopSocialRepository.save({ ...existingShop.settings.socials, ...updatedSocials });
            //   console.log("social", existingShop.settings.socials)

            // }
          }
          
        
          if (updateShopDto.settings.location) {
            
            const Location = await this.locationRepository.findOne({
              where: {id: setting.location.id}
            });
            console.log("locationPPPPPPPPP", Location.id)

            if(Location){

               try{
               console.log("crubbbbbbb", Location)
               const updatedLocation = this.locationRepository.create(updateShopDto.settings.location);
               existingShop.settings.location = Location
               existingShop.settings.location = await this.locationRepository.save({ ...existingShop.settings.location, ...updatedLocation });
               console.log("location", updateShopDto.settings.location)

            }catch(error){

              console.log("Location Data Already Up to Date")
            }
            }
        }
        
        } else {
          console.error(`Setting with id ${updateShopDto.settings.id} not found`);
        }
      }
      
      if (updateShopDto.balance) {

        const balance = await this.balanceRepository.findOne({
          where: {id: existingShop.balance.id},
          relations: ["payment_info"]
        });
        console.log("updateBalance++++", balance);

        if (balance) {
           
          try{
                 console.log("first", balance, updateShopDto.balance)
            const updatedBalance = this.balanceRepository.create(updateShopDto.balance);
            console.log("updateBalance---------", balance.id);
  
            existingShop.balance = balance;
            console.log("tryy++++++++++", existingShop.balance, "try-----------", balance)
             
            existingShop.balance = await this.balanceRepository.save({ ...existingShop.balance, ...updatedBalance });
            console.log("balance111", existingShop.balance);        
          
          } catch(error) {
            console.error('Balance Data Already Up to Date')
          }

          if (updateShopDto.balance.payment_info) {

            const payment = await this.paymentInfoRepository.findOne({
              where: {id: balance.payment_info.id}
            });
             console.log("burrhhhhh", payment)
            if(payment) {
          
              try{
              const updatedPaymentInfo = this.paymentInfoRepository.create(updateShopDto.balance.payment_info);
              console.log("paymentUpdate", updatedPaymentInfo)
              existingShop.balance.payment_info = payment
              console.log("balancePaymentInfo", existingShop.balance.payment_info)
              existingShop.balance.payment_info = await this.paymentInfoRepository.save({ ...existingShop.balance.payment_info, ...updatedPaymentInfo });

              console.log("payment", existingShop.balance.payment_info);

              }catch(error){
                console.log("Payment Data is already up to date.")
              }
            }        
        } 
        } else {
          console.error(`Balance with id ${updateShopDto.balance.id} not found or Data Already Up to Date`);
        }
      }
     console.log("final data", existingShop)  
      return await this.shopRepository.save(existingShop);
    } else {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }
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
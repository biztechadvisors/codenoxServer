/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common'
import { ApproveShopDto, CreateShopDto } from './dto/create-shop.dto'
import { UpdateShopDto } from './dto/update-shop.dto'
import { Shop } from './entities/shop.entity'
import Fuse from 'fuse.js'
import { GetShopsDto } from './dto/get-shops.dto'
import { paginate } from 'src/common/pagination/paginate'
import { GetStaffsDto } from './dto/get-staffs.dto'
import { AddressRepository, BalanceRepository, LocationRepository, PaymentInfoRepository, ShopRepository, ShopSettingsRepository, ShopShocialRepository } from './shops.repository'
import { InjectRepository } from '@nestjs/typeorm'
import { convertToSlug } from 'src/helpers'
import { Balance } from './entities/balance.entity'
import { ShopSettings } from './entities/shopSettings.entity'
import { ShopSocials } from 'src/settings/entities/setting.entity'
import { AddStaffDto } from 'src/users/dto/add-staff.dto'
// import { User } from 'src/users/entities/user.entity'
import { UserRepository } from 'src/users/users.repository'


// const shops = plainToClass(Shop, shopsJson)
// const options = {
//   keys: ['name', 'type.slug', 'is_active'],
//   threshold: 0.3,
// }
// const fuse = new Fuse(shops, options)

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
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}
  private shops: Shop[] = []


  async convertToSlug(text) {
    return await convertToSlug(text)
  }

  async create( addStaffDto: AddStaffDto , createShopDto: CreateShopDto): Promise<Shop> {

      let value: any
      let value1: any
      let value2: any
      let saved: any
      let locationId:any
     

      const newShop = new Shop()
      const newBalance = new Balance()
      const newSetting = new ShopSettings()

      if(addStaffDto){

        // const addStaff = new User()

        // addStaff.managed_shop = addStaffDto.shop_id
        const newStaff = this.userRepository.create(addStaffDto)
        // addStaff.name = addStaffDto.name
        // addStaff.email = addStaffDto.email
        // addStaff.password = addStaffDto.password
        // addStaff.createdAt = addStaffDto
        //  newStaff = addStaff
       const staffAdded = await this.userRepository.save(newStaff)
       console.log("first", staffAdded)

      } else {

      // const newshopss = this.shopRepository.create(createShopDto)

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
    newShop.owner = createShopDto.owner;
    newShop.cover_image = createShopDto.cover_image;
    newShop.logo = createShopDto.logo;
    newShop.address = value1;
    newShop.settings = value2;

  
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

  }


  async getShops({ search, limit, page }: GetShopsDto) {
    if (!page) page = 1;
  
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    let data: Shop[] = await this.shopRepository.find({
      relations: [
        'balance',
        'balance.payment_info',
        'settings',
        'settings.socials',
        'settings.location',
        'address',
        'owner',

      ],
    });
  
    
    const fuse = new Fuse(data, {
      keys: ['name', 'id', 'slug', 'is_active', 'address.city', 'address.state', 'address.country'],
      threshold: 0.7, 
    });
  
    if (search) {
      const searchResults = fuse.search(search);
      const matchedShops = searchResults ? searchResults.map(({ item }) => item) : [];
      data = matchedShops;
      console.log("first", data)
    }
       
    const results = data.slice(startIndex, endIndex);
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, `/shops?search=${search}&limit=${limit}`),
    };
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

  async getShop(slug: string ): Promise<Shop | null> {

     try {
     const existShop = await this.shopRepository.find({
      where: {slug: slug},
      relations: [
         "balance",
         "address",
         "settings",
         "cover_image",
         "logo",
         "balance.payment_info",
         "settings.socials",
         "settings.location"
        ]
    })

      if(!existShop){
       return null        
      } else {

        for (let index = 0; index < existShop.length; index++) {
          const shop = existShop[index];
          console.log("shop data", shop);
          return shop;
        }
      }
     }catch(error){
      console.error("Shop Not Found")
     }
   
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
          
            for (const updateSocial of updateShopDto.settings.socials) {
          
              console.log("user inserted data", updateShopDto.settings.socials)
              const existingSocial = setting.socials.find(
                (social) => social.icon === updateSocial.icon                        
              );
              console.log("*******", existingSocial)
            
              if (existingSocial) {

                Object.assign(existingSocial, updateSocial);
                

                const updatedSocial = await this.shopSocialRepository.save(existingSocial);
                console.log("Updated Social:", updatedSocial);
                
                socials.push(updatedSocial); 
              } else {
               
                const newSocial = this.shopSocialRepository.create({ ...updateSocial });
                const savedSocial = await this.shopSocialRepository.save(newSocial);
                console.log("New Social:", savedSocial);
          
                socials.push(savedSocial); 
                console.log("new element",socials)
              }
            }

            existingShop.settings.socials = socials;           
           
          }
          

          const updatedShop = await this.shopsettingRepository.save(existingShop);
            console.log("Updated Shop:", updatedShop);
         
              const socialIds = updatedShop.settings.socials.map((social) => social.id);
              console.log("Social IDs:", socialIds);

        
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
    console.log("first", id)
    return `This action removes a #${id} shop`
  }

  remove(id: number) {

    return `This action removes a #${id} shop`
  }

 async disapproveShop(id: number) {
    // const shop = this.shops.find((s) => s.id === Number(id))
    // shop.is_active = false
    // return shop
    try{
      const shop = await this.shopRepository.find({
        where: {id: id},
        relations: [
          "balance",
          "balance.payment_info",
          "settings",
          "settings.socials",
          "settings.location"
        ]
      })
      console.log("shops", shop)
      for (let index = 0; index < shop.length; index++) {
        const shops = shop[index];
        shops.is_active =false
        console.log("shop data", shops);
        const updatedShop = this.shopRepository.save(shops)
        return updatedShop;
      }
    } catch(error) {
        console.log(error.message)
    } 
    
  }

  async approveShop(approveShopDto: ApproveShopDto): Promise<Shop> {
   console.log("first", approveShopDto)
    try{
    const shop = await this.shopRepository.find({
      where: {id: approveShopDto.id},
      relations: [
        "balance",
        "balance.payment_info",
        "settings",
        "settings.socials",
        "settings.location"
      ]
    })
    console.log("shops", shop)
    for (let index = 0; index < shop.length; index++) {
      const shops = shop[index];
      shops.is_active = true

      const balance = await this.balanceRepository.findOne({
        where: {id: shops.balance.id}
      })
      console.log("balance", balance)

    if(balance){
      balance.admin_commission_rate = approveShopDto.admin_commission_rate
      const updateData = await this.balanceRepository.save(balance)
      shops.balance.admin_commission_rate = balance.admin_commission_rate
      console.log("shop data5555555", updateData);
    }
      console.log("shop data", shops);

      const updatedShop = this.shopRepository.save(shops)
      return updatedShop;
    }
  } catch(error) {
      console.log(error.message)
  } 
  }
}
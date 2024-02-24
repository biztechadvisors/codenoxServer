/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ApproveShopDto, CreateShopDto } from './dto/create-shop.dto'
import { UpdateShopDto } from './dto/update-shop.dto'
import { PaymentInfo, Shop } from './entities/shop.entity'
import Fuse from 'fuse.js'
import { GetShopsDto } from './dto/get-shops.dto'
import { paginate } from 'src/common/pagination/paginate'
import { GetStaffsDto } from './dto/get-staffs.dto'
import { AddressRepository, BalanceRepository, LocationRepository, PaymentInfoRepository, ShopRepository, ShopSettingsRepository, ShopSocialsRepository } from './shops.repository'
import { InjectRepository } from '@nestjs/typeorm'
import { convertToSlug } from 'src/helpers'
import { Balance } from './entities/balance.entity'
import { Location, ShopSocials } from 'src/settings/entities/setting.entity'
import { UserRepository } from 'src/users/users.repository'
import { Address, AddressType, UserAddress } from 'src/addresses/entities/address.entity'
import { User, UserType } from 'src/users/entities/user.entity'
import { Attachment } from 'src/common/entities/attachment.entity'
import { AttachmentRepository } from 'src/common/common.repository'
import { ShopSettings } from './entities/shopSettings.entity'
import { AddressesService } from 'src/addresses/addresses.service'
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto'
import { UserAddressRepository } from 'src/addresses/addresses.repository'

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: ShopRepository,
    @InjectRepository(Balance)
    private readonly balanceRepository: BalanceRepository,
    @InjectRepository(ShopSettings)
    private readonly shopSettingsRepository: ShopSettingsRepository,
    @InjectRepository(PaymentInfo)
    private readonly paymentInfoRepository: PaymentInfoRepository,
    @InjectRepository(Address)
    private readonly addressRepository: AddressRepository,
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: UserAddressRepository,
    @InjectRepository(ShopSocials)
    private readonly shopSocialsRepository: ShopSocialsRepository,
    @InjectRepository(Location)
    private readonly locationRepository: LocationRepository,
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: AttachmentRepository,
    private readonly addressesService: AddressesService,
  ) { }

  private shops: Shop[] = []

  async convertToSlug(text:any) {
    return await convertToSlug(text)
  }

  async create(createShopDto: CreateShopDto): Promise<Shop> {
    const newShop = new Shop();
    const newBalance = new Balance();
    const newSetting = new ShopSettings();
    try {
      const userToUpdate = await this.userRepository.findOne({ where: { id: createShopDto.user.id } });
      // Check if the user exists and is a vendor
      if (!userToUpdate && userToUpdate.type !== UserType.Vendor) {
        throw new Error('User does not exist or is not a vendor');
      }
      let addressId;
      if (createShopDto.address) {
        const createAddressDto = new CreateAddressDto();
        createAddressDto.title = createShopDto.address.street_address;
        createAddressDto.type = AddressType.SHOP;
        createAddressDto.default = true;
        createAddressDto.address = createShopDto.address;
        createAddressDto.customer_id = createShopDto.user.id;

        // Save the new UserAddress and retrieve the saved entity
        const savedAddress = await this.addressesService.create(createAddressDto);
        addressId = savedAddress.address.id;

        // Check if the addressId exists in the user_address table
        const addressExists = await this.userAddressRepository.findOne({ where: { id: addressId } });
        if (!addressExists) {
          throw new Error('Address does not exist in the user_address table');
        }
      }

      let settingId;
      if (createShopDto.settings) {
        const newSettings = this.shopSettingsRepository.create(createShopDto.settings)
        if (createShopDto.settings.socials) {
          const socials: ShopSocials[] = [];
          for (const social of createShopDto.settings.socials) {
            const newSocial = this.shopSocialsRepository.create(social)
            const socialId = await this.shopSocialsRepository.save(newSocial)
            socials.push(socialId);
          }
          newSetting.socials = socials
        }
        let locationId;
        if (createShopDto.settings.location) {
          const newLocation = this.locationRepository.create(createShopDto.settings.location)
          locationId = await this.locationRepository.save(newLocation)
        }
        newSetting.contact = createShopDto.settings.contact
        newSetting.website = createShopDto.settings.website
        newSetting.location = locationId;
        settingId = await this.shopSettingsRepository.save(newSetting)
        const socialIds = settingId.socials.map((social) => social.id);
        newSetting.socials = socialIds;
      }
      newShop.name = createShopDto.name;
      newShop.slug = await this.convertToSlug(createShopDto.name);
      newShop.description = createShopDto.description;
      newShop.owner = createShopDto.user;
      newShop.owner_id = createShopDto.user.id
      newShop.cover_image = createShopDto.cover_image;
      newShop.logo = createShopDto.logo;
      newShop.address = addressId;
      newShop.settings = settingId;
      newShop.createdAt = new Date()
      const shop = await this.shopRepository.save(newShop)
      let saved;
      if (createShopDto.balance) {
        if (createShopDto.balance.payment_info) {
          const newPaymentInfo = this.paymentInfoRepository.create(createShopDto.balance.payment_info);
          saved = await this.paymentInfoRepository.save(newPaymentInfo);
        }
        newBalance.admin_commission_rate = createShopDto.balance.admin_commission_rate
        newBalance.current_balance = createShopDto.balance.current_balance
        newBalance.payment_info = saved.id
        newBalance.total_earnings = createShopDto.balance.total_earnings
        newBalance.withdrawn_amount = createShopDto.balance.withdrawn_amount
        newBalance.shop = shop;
        const balanceId = await this.balanceRepository.save(newBalance);
        newShop.balance = balanceId;
      }
      if (createShopDto.user) {
        const shp = new User();
        shp.shop_id = shop.id;
        shp.managed_shop = shop;

        // Find the user by id
        const userToUpdate = await this.userRepository.findOne({ where: { id: createShopDto.user.id } });

        // If the user exists, update the fields
        if (userToUpdate) {
          userToUpdate.shop_id = shp.shop_id;
          userToUpdate.managed_shop = shp.managed_shop;

          // Save the updated user
          await this.userRepository.save(userToUpdate);
        }
      }
      await this.shopRepository.save(newShop)
      // Use the repository's findOne method to get the newly created shop with all its relations
      const createdShop = await this.shopRepository.findOne({ where: { id: shop.id }, relations: ['balance'] });

      return createdShop;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('An error occurred while creating the shop.');
    }
  }

  async getShops({ search, limit, page }: GetShopsDto) {
    page = page || 1;
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
    if (search) {
      const fuse = new Fuse(data, {
        keys: ['name', 'id', 'slug', 'is_active', 'address.city', 'address.state', 'address.country'],
        threshold: 0.7,
      });
      const searchResults = fuse.search(search);
      data = searchResults.map(({ item }) => item);
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

  async getShop(slug: string): Promise<Shop | null> {
    const existShop = await this.shopRepository.findOne({
      where: { slug: slug },
      relations: [
        "balance",
        "address",
        "settings",
        "cover_image",
        "logo",
        "balance.payment_info",
        "settings.socials",
        "settings.location",
      ]
    });

    if (!existShop) {
      console.error("Shop Not Found");
      return null;
    }

    return existShop;
  }

  async update(id: number, updateShopDto: UpdateShopDto): Promise<Shop> {
    const existingShop = await this.shopRepository.findOne({
      where: { id: id },
      relations: ["balance", "address", "settings"]
    });

    if (!existingShop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }

    // Store the IDs of the existing cover_image and logo attachments
    const existingCoverImageId = existingShop.cover_image;
    const existingLogoId = existingShop.logo;

    // Set the cover_image and logo fields in the shopRepository to null
    existingShop.cover_image = null;
    existingShop.logo = null;
    await this.shopRepository.save(existingShop);

    // Remove existing cover_image and logo attachments
    if (existingCoverImageId) {
      await this.attachmentRepository.delete(existingCoverImageId);
    }

    if (existingLogoId) {
      await this.attachmentRepository.delete(existingLogoId);
    }

    // Update fields
    existingShop.name = updateShopDto.name;
    existingShop.slug = await this.convertToSlug(updateShopDto.name);
    existingShop.description = updateShopDto.description;

    // Save new cover_image and logo attachments
    existingShop.cover_image = updateShopDto.cover_image;
    existingShop.logo = updateShopDto.logo;
    existingShop.name = updateShopDto.name;
    existingShop.slug = await this.convertToSlug(updateShopDto.name);
    existingShop.description = updateShopDto.description;
    existingShop.cover_image = updateShopDto.cover_image;
    existingShop.logo = updateShopDto.logo;
    existingShop.owner = updateShopDto.user;
    existingShop.owner_id = updateShopDto.user.id

    if (updateShopDto.address) {
      const updatedAddress = this.addressRepository.create(updateShopDto.address);
      existingShop.address = await this.addressRepository.save({ ...existingShop.address, ...updatedAddress });
    }

    if (updateShopDto.settings) {
      const setting = await this.shopSettingsRepository.findOne({
        where: { id: existingShop.settings.id },
        relations: ["socials", "location"]
      });

      if (setting) {
        const updatedSettings = this.shopSettingsRepository.create(updateShopDto.settings);
        existingShop.settings = await this.shopSettingsRepository.save({ ...setting, ...updatedSettings });

        if (updateShopDto.settings.socials) {
          const socials: ShopSocials[] = [];
          for (const updateSocial of updateShopDto.settings.socials) {
            const existingSocial = setting.socials.find(
              (social) => social.icon === updateSocial.icon
            );
            if (existingSocial) {
              Object.assign(existingSocial, updateSocial);
              const updatedSocial = await this.shopSocialsRepository.save(existingSocial);
              socials.push(updatedSocial);
            } else {
              const newSocial = this.shopSocialsRepository.create({ ...updateSocial });
              const savedSocial = await this.shopSocialsRepository.save(newSocial);
              socials.push(savedSocial);
            }
          }
          existingShop.settings.socials = socials;
        }

        if (updateShopDto.settings.location) {
          const Location = await this.locationRepository.findOne({
            where: { id: setting.location.id }
          });
          if (Location) {
            const updatedLocation = this.locationRepository.create(updateShopDto.settings.location);
            existingShop.settings.location = await this.locationRepository.save({ ...Location, ...updatedLocation });
          }
        }
      }
    }

    if (updateShopDto.balance) {
      const balance = await this.balanceRepository.findOne({
        where: { id: existingShop.balance.id },
        relations: ["payment_info"]
      });
      if (balance) {
        const updatedBalance = this.balanceRepository.create(updateShopDto.balance);
        existingShop.balance = await this.balanceRepository.save({ ...balance, ...updatedBalance });

        if (updateShopDto.balance.payment_info) {
          const payment = await this.paymentInfoRepository.findOne({
            where: { id: balance.payment_info.id }
          });
          if (payment) {
            const updatedPaymentInfo = this.paymentInfoRepository.create(updateShopDto.balance.payment_info);
            existingShop.balance.payment_info = await this.paymentInfoRepository.save({ ...payment, ...updatedPaymentInfo });
          }
        }
      }
    }

    existingShop.createdAt = new Date()

    return await this.shopRepository.save(existingShop);
  }

  async changeShopStatus(id: number, status: boolean): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }
    shop.is_active = status;
    return this.shopRepository.save(shop);
  }

  async remove(id: number): Promise<void> {
    const shop = await this.shopRepository.findOne({
      where: { id },
      relations: [
        "balance",
        "balance.payment_info",
        "settings",
        "settings.socials",
        "settings.location",
        "address"
      ]
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }

    await this.shopRepository.remove(shop);
  }

  async disapproveShop(id: number): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }
    shop.is_active = false;
    return this.shopRepository.save(shop);
  }

  async approveShop(approveShopDto: ApproveShopDto): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { id: approveShopDto.id },
      relations: [
        "balance",
        "balance.payment_info",
        "settings",
        "settings.socials",
        "settings.location"
      ]
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${approveShopDto.id} not found`);
    }

    shop.is_active = true;

    const balance = await this.balanceRepository.findOne({
      where: { id: shop.balance.id }
    });

    if (balance) {
      balance.admin_commission_rate = approveShopDto.admin_commission_rate;
      await this.balanceRepository.save(balance);
      shop.balance.admin_commission_rate = balance.admin_commission_rate;
    }

    return this.shopRepository.save(shop);
  }
}
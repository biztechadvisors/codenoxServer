/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ApproveShopDto, CreateShopDto } from './dto/create-shop.dto'
import { UpdateShopDto } from './dto/update-shop.dto'
import { PaymentInfo, Shop } from './entities/shop.entity'
import Fuse from 'fuse.js'
import { GetShopsDto, ShopPaginator } from './dto/get-shops.dto'
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
import { Permission } from 'src/permission/entities/permission.entity'
import { FindOperator, ILike, Repository } from 'typeorm'

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
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    private readonly addressesService: AddressesService,
  ) { }

  private shops: Shop[] = []

  async convertToSlug(text) {
    return await convertToSlug(text)
  }

  async create(createShopDto: CreateShopDto): Promise<Shop> {
    const newShop = new Shop();
    const newBalance = new Balance();
    const newSetting = new ShopSettings();
    try {
      const userToUpdate = await this.userRepository.findOne({ where: { id: createShopDto.user.id }, relations: ['type'] });

      if (!userToUpdate) {
        throw new Error('User does not exist');
      }

      if (userToUpdate.type.type_name !== UserType.Company) {
        throw new Error('User is not a vendor');
      }

      let addressId;
      if (createShopDto.address) {
        const createAddressDto = new CreateAddressDto();
        createAddressDto.title = createShopDto.address.street_address;
        createAddressDto.type = AddressType.SHOP;
        createAddressDto.default = true;
        createAddressDto.address = createShopDto.address;
        createAddressDto.customer_id = createShopDto.user.id;

        const savedAddress = await this.addressesService.create(createAddressDto);
        addressId = savedAddress.address.id;

        const addressExists = await this.userAddressRepository.findOne({ where: { id: addressId } });
        if (!addressExists) {
          throw new Error('Address does not exist in the user_address table');
        }
      }

      let settingId;

      if (createShopDto.settings) {
        const newSettings = this.shopSettingsRepository.create(createShopDto.settings);

        if (createShopDto.settings.socials && createShopDto.settings.socials.length > 0) {
          const socials: ShopSocials[] = [];
          for (const social of createShopDto.settings.socials) {
            const newSocial = this.shopSocialsRepository.create(social);
            const savedSocial = await this.shopSocialsRepository.save(newSocial);
            socials.push(savedSocial);
          }
          newSettings.socials = socials;
        }

        let savedLocation;
        if (createShopDto.settings.location) {
          const newLocation = this.locationRepository.create(createShopDto.settings.location);
          savedLocation = await this.locationRepository.save(newLocation);
          newSettings.location = savedLocation;
        }

        newSettings.contact = createShopDto.settings.contact;
        newSettings.website = createShopDto.settings.website;

        settingId = await this.shopSettingsRepository.save(newSettings);

        if (settingId.socials) {
          const socialIds = settingId.socials.map((social) => social.id);
          settingId.socials = socialIds;
        }
      }

      newShop.name = createShopDto.name;
      newShop.slug = await this.convertToSlug(createShopDto.name);
      newShop.description = createShopDto.description;
      newShop.owner = createShopDto.user;
      newShop.owner_id = createShopDto.user.id;
      newShop.cover_image = createShopDto.cover_image;
      newShop.logo = createShopDto.logo;
      newShop.address = addressId;
      newShop.settings = settingId;
      newShop.created_at = new Date();
      const shop = await this.shopRepository.save(newShop);

      if (createShopDto.balance) {
        let savedPaymentInfo;
        if (createShopDto.balance.payment_info) {
          const newPaymentInfo = this.paymentInfoRepository.create(createShopDto.balance.payment_info);
          savedPaymentInfo = await this.paymentInfoRepository.save(newPaymentInfo);
        }
        newBalance.admin_commission_rate = createShopDto.balance.admin_commission_rate;
        newBalance.current_balance = createShopDto.balance.current_balance;
        // Ensure savedPaymentInfo is defined before accessing its id property
        if (savedPaymentInfo) {
          newBalance.payment_info = savedPaymentInfo.id;
        }
        newBalance.total_earnings = createShopDto.balance.total_earnings;
        newBalance.withdrawn_amount = createShopDto.balance.withdrawn_amount;
        newBalance.shop = shop;
        const balanceId = await this.balanceRepository.save(newBalance);
        newShop.balance = balanceId;
      }


      if (createShopDto.user) {
        const shp = new User();
        shp.shop_id = shop.id;
        shp.managed_shop = shop;

        const userToUpdate = await this.userRepository.findOne({ where: { id: createShopDto.user.id }, relations: ['type'] });

        if (userToUpdate) {
          userToUpdate.shop_id = shp.shop_id;
          userToUpdate.managed_shop = shp.managed_shop;
          await this.userRepository.save(userToUpdate);
        }
      }

      if (createShopDto.permission || createShopDto.additionalPermissions) {
        const permission = await this.permissionRepository.findOne({
          where: { permission_name: ILike(createShopDto.permission) as unknown as FindOperator<string> },
        });

        const additionalPermissions = await this.permissionRepository.find({
          where: { permission_name: ILike(createShopDto.additionalPermissions) as unknown as FindOperator<string> },
        });

        if (permission) {
          newShop.permission = permission;
        }

        if (additionalPermissions) {
          newShop.additionalPermissions = additionalPermissions;
        }
      }

      await this.shopRepository.save(newShop);
      const createdShop = await this.shopRepository.findOne({ where: { id: shop.id }, relations: ['balance'] });
      return createdShop;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('An error occurred while creating the shop.');
    }
  }

  async getShops({ search, limit, page }: GetShopsDto): Promise<ShopPaginator> {

    page = page ? page : 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let data: Shop[] = await this.shopRepository.find({
      relations: [
        'balance',
        'balance.shop',
        'balance.dealer',
        'balance.payment_info',
        'settings',
        'settings.socials',
        'settings.location',
        'address',
        'owner',
        'owner.profile',
        'cover_image',
        'logo',
        'staffs',
        'additionalPermissions',
        'permission'
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

    const results = search ? data.slice(startIndex, endIndex) : data;
    const mappedResults = results.map((shop) => ({
      created_at: shop.created_at,
      updated_at: shop.updated_at,
      id: shop.id,
      owner_id: shop.owner_id,
      is_active: shop.is_active,
      orders_count: shop.orders_count,
      products_count: shop.products_count,
      name: shop.name,
      slug: shop.slug,
      description: shop.description,
      gst_number: shop.gst_number,
      balance: {
        id: shop?.balance?.id,
        admin_commission_rate: shop.balance?.admin_commission_rate,
        total_earnings: shop.balance?.total_earnings,
        withdrawn_amount: shop.balance?.withdrawn_amount,
        current_balance: shop.balance?.current_balance,
        shop: shop.balance?.shop, // Adjust accordingly
        dealer: null, // Update with actual dealer data if available
        payment_info: {
          id: shop.balance?.payment_info.id,
          account: shop.balance?.payment_info.account,
          name: shop.balance?.payment_info.name,
          email: shop.balance?.payment_info.email,
          bank: shop.balance?.payment_info.bank,
        },
      },
      settings: {
        id: shop.settings.id,
        contact: shop.settings.contact,
        website: shop.settings.website,
        socials: shop.settings.socials,
        location: shop.settings.location,
      },
      address: {
        id: shop.address.id,
        street_address: shop.address.street_address,
        country: shop.address.country,
        city: shop.address.city,
        state: shop.address.state,
        zip: shop.address.zip,
      },
      owner: {
        is_active: shop.owner.is_active,
        created_at: shop.owner.created_at,
        updated_at: shop.owner.updated_at,
        id: shop.owner.id,
        name: shop.owner.name,
        email: shop.owner.email,
        password: shop.owner.password,
        otp: shop.owner.otp,
        isVerified: shop.owner.isVerified,
        shop_id: shop.owner.shop_id,
        type: shop.owner.type,
        walletPoints: shop.owner.walletPoints,
        contact: shop.owner.contact,
        email_verified_at: shop.owner.email_verified_at,
        profile: shop.owner.profile, // Update with actual profile data if available
      },
      cover_image: {
        id: shop.cover_image?.id || "",
        thumbnail: shop.cover_image?.thumbnail || "",
        original: shop.cover_image?.original || "",
      },
      logo: {
        id: shop.logo?.id || "",
        thumbnail: shop.logo?.thumbnail || "",
        original: shop.logo?.original || "",
      },
      staffs: shop.staffs,
      additionalPermissions: shop.additionalPermissions,
      permission: shop.permission
    }));

    return {
      data: mappedResults as unknown as Shop[],
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
    try {
      const existShop = await this.shopRepository.findOne({
        where: { slug: slug },
        relations: [
          'balance',
          'balance.shop',
          'balance.dealer',
          'balance.payment_info',
          'settings',
          'settings.socials',
          'settings.location',
          'address',
          'owner',
          'owner.profile',
          'cover_image',
          'logo',
          'staffs',
          'category',
          'order',
          'additionalPermissions',
          'permission'
        ],
      });
      if (!existShop) {
        console.error("Shop Not Found");
        return null;
      }

      // Map the retrieved shop data to the desired structure
      const mappedShop = {
        id: existShop?.id,
        owner_id: existShop?.owner_id,
        name: existShop.name,
        slug: existShop.slug,
        description: existShop.description,
        balance: {
          id: existShop?.balance?.id,
          admin_commission_rate: existShop?.balance?.admin_commission_rate,
          total_earnings: existShop?.balance?.total_earnings,
          withdrawn_amount: existShop?.balance?.withdrawn_amount,
          current_balance: existShop?.balance?.current_balance,
          shop: existShop?.balance?.shop, // Adjust accordingly
          dealer: null, // Update with actual dealer data if available
          payment_info: {
            id: existShop?.balance?.payment_info?.id,
            account: existShop?.balance?.payment_info?.account,
            name: existShop?.balance?.payment_info?.name,
            email: existShop?.balance?.payment_info?.email,
            bank: existShop?.balance?.payment_info.bank,
          },
        },
        cover_image: {
          id: existShop?.cover_image?.id,
          original: existShop.cover_image?.original,
          thumbnail: existShop.cover_image?.thumbnail,
        },
        logo: {
          id: existShop?.logo?.id,
          original: existShop.logo?.original,
          thumbnail: existShop.logo?.thumbnail,
        },
        is_active: existShop.is_active,
        address: {
          ...existShop?.address,
        },
        settings: {
          ...existShop?.settings,
        },
        created_at: existShop.created_at,
        updated_at: existShop.updated_at,
        orders_count: existShop.orders_count,
        products_count: existShop.products_count,
        owner: {
          ...existShop.owner,
          profile: {
            ...existShop.owner.profile,
          },
          walletPoints: 0,
          contact: '', // Set an appropriate default value
        },
        gst_number: existShop.gst_number, // Include the missing property
        category: existShop.category,
        subCategories: existShop.subCategories,
        order: existShop.order,
        additionalPermissions: existShop.additionalPermissions,
        permission: existShop.permission
      };

      return mappedShop;
    } catch (error) {
      console.error("Error fetching shop:", error.message);
      return null;
    }
  }

  async update(id: number, updateShopDto: UpdateShopDto): Promise<Shop> {
    const existingShop = await this.shopRepository.findOne({
      where: { id: id },
      relations: ["balance", "address", "settings", "settings.socials", "settings.location"]
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
    existingShop.cover_image = updateShopDto.cover_image;
    existingShop.logo = updateShopDto.logo;
    existingShop.owner = updateShopDto.user;
    existingShop.owner_id = updateShopDto.user.id;

    if (updateShopDto.address) {
      const updatedAddress = this.addressRepository.create(updateShopDto.address);
      existingShop.address = await this.addressRepository.save({ ...existingShop.address, ...updatedAddress });
    }

    if (updateShopDto.settings) {
      const setting = existingShop.settings;

      // Update settings directly
      Object.assign(setting, updateShopDto.settings);

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
            const newSocial = this.shopSocialsRepository.create(updateSocial);
            const savedSocial = await this.shopSocialsRepository.save(newSocial);
            socials.push(savedSocial);
          }
        }

        // Remove socials not in updateShopDto
        const socialsToRemove = setting.socials.filter(
          (social) => !updateShopDto.settings.socials.some(
            (updateSocial) => updateSocial.icon === social.icon
          )
        );

        for (const social of socialsToRemove) {
          await this.shopSocialsRepository.remove(social);
        }

        setting.socials = socials;
      } else {
        // Remove all socials if not provided in updateShopDto
        await this.shopSocialsRepository.remove(setting.socials);
        setting.socials = [];
      }

      if (updateShopDto.settings.location) {
        if (setting.location) {
          // Update existing location
          Object.assign(setting.location, updateShopDto.settings.location);
          setting.location = await this.locationRepository.save(setting.location);
        } else {
          // Create new location if it doesn't exist
          const newLocation = this.locationRepository.create(updateShopDto.settings.location);
          setting.location = await this.locationRepository.save(newLocation);
        }
      } else if (setting.location) {
        // Remove location if not provided in updateShopDto
        await this.locationRepository.remove(setting.location);
        setting.location = null;
      }

      // Save updated settings
      await this.shopSettingsRepository.save(setting);
      existingShop.settings = setting;
    }

    if (updateShopDto.balance) {
      const balance = await this.balanceRepository.findOne({
        where: { id: existingShop.balance.id },
        relations: ["payment_info"],
      });

      if (balance) {
        // Retrieve payment_info separately
        const payment = await this.paymentInfoRepository.findOne({
          where: { id: balance.payment_info.id },
        });

        if (payment) {
          // Update payment_info properties
          payment.account = updateShopDto.balance.payment_info.account;
          payment.bank = updateShopDto.balance.payment_info.bank;
          payment.email = updateShopDto.balance.payment_info.email;
          payment.name = updateShopDto.balance.payment_info.name;

          // Similar approach for payment_info
          await this.paymentInfoRepository
            .createQueryBuilder("payment_info")
            .update()
            .set(payment)
            .where("payment_info.id = :id", { id: balance.payment_info.id })
            .execute();
        }
      }
    }
    existingShop.created_at = new Date();

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
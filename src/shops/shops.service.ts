/* eslint-disable prettier/prettier */
import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ApproveShopDto, CreateShopDto } from './dto/create-shop.dto'
import { UpdateShopDto } from './dto/update-shop.dto'
import { PaymentInfo, Shop } from './entities/shop.entity'
import Fuse from 'fuse.js'
import { GetShopsDto, ShopPaginator } from './dto/get-shops.dto'
import { paginate } from 'src/common/pagination/paginate'
import { GetStaffsDto } from './dto/get-staffs.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { convertToSlug } from 'src/helpers'
import { Balance } from './entities/balance.entity'
import { Location, ShopSocials } from 'src/settings/entities/setting.entity'
import { Add, AddressType, UserAdd } from 'src/address/entities/address.entity'
import { User, UserType } from 'src/users/entities/user.entity'
import { Attachment } from 'src/common/entities/attachment.entity'
import { ShopSettings } from './entities/shopSettings.entity'
import { AddressesService } from 'src/address/addresses.service'
import { Permission } from 'src/permission/entities/permission.entity'
import { FindOperator, ILike, Repository } from 'typeorm'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { AnalyticsService } from '../analytics/analytics.service'
import { CreateAddressDto } from '../address/dto/create-address.dto'

@Injectable()
export class ShopsService {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly addressService: AddressesService,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    @InjectRepository(ShopSettings)
    private readonly shopSettingsRepository: Repository<ShopSettings>,
    @InjectRepository(PaymentInfo)
    private readonly paymentInfoRepository: Repository<PaymentInfo>,
    @InjectRepository(Add)
    private readonly addressRepository: Repository<Add>,
    @InjectRepository(UserAdd)
    private readonly userAddressRepository: Repository<UserAdd>,
    @InjectRepository(ShopSocials)
    private readonly shopSocialsRepository: Repository<ShopSocials>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

  ) { }

  async convertToSlug(text) {
    return await convertToSlug(text)
  }

  async create(createShopDto: CreateShopDto): Promise<Shop> {
    const newShop = new Shop();

    try {
      // Retrieve the user
      const userToUpdate = await this.userRepository.findOne({
        where: { id: createShopDto.user.id },
        relations: ['permission'],
      });

      if (!userToUpdate) {
        throw new Error('User does not exist');
      }

      if (userToUpdate.permission.type_name !== UserType.Company) {
        throw new Error('User is not authorized to create a shop');
      }

      // Handle address creation using the AddressService
      let addressId: UserAdd | undefined;
      if (createShopDto.address) {
        const addressDto: CreateAddressDto = {
          customer_id: userToUpdate.id, // Ensure this is correctly set to the user ID
          title: `${createShopDto.address.street_address} ${createShopDto.address.city} ${createShopDto.address.state}`,
          type: AddressType.SHOP,
          default: true,
          address: {
            street_address: createShopDto.address.street_address,
            country: createShopDto.address.country,
            city: createShopDto.address.city,
            state: createShopDto.address.state,
            zip: createShopDto.address.zip,
            id: 0,
            customer_id: 0,
            created_at: new Date(),
            updated_at: new Date()
          },
        };

        const savedAddress = await this.addressService.create(addressDto); // Call the AddressService
        addressId = savedAddress.address; // Assuming savedAddress contains the UserAdd
      }

      // Shop settings logic
      let settingId: ShopSettings | undefined;
      if (createShopDto.settings) {
        const newSettings = this.shopSettingsRepository.create(createShopDto.settings);

        // Handle shop socials if provided
        if (createShopDto.settings.socials?.length > 0) {
          const savedSocials = await Promise.all(
            createShopDto.settings.socials.map((social) =>
              this.shopSocialsRepository.save(this.shopSocialsRepository.create(social))
            )
          );
          newSettings.socials = savedSocials;
        }

        // Handle shop location
        if (createShopDto.settings.location) {
          const savedLocation = await this.locationRepository.save(
            this.locationRepository.create(createShopDto.settings.location)
          );
          newSettings.location = savedLocation;
        }

        // Save settings
        settingId = await this.shopSettingsRepository.save(newSettings);
      }

      // Create and save the shop
      newShop.name = createShopDto.name;
      newShop.slug = await this.convertToSlug(createShopDto.name);
      newShop.description = createShopDto.description;
      newShop.owner = userToUpdate;
      newShop.owner_id = createShopDto.user.id;
      newShop.address = addressId; // This should now have the correct address ID
      newShop.settings = settingId;
      newShop.created_at = new Date();

      // Handle cover image if provided
      if (createShopDto.cover_image?.length > 0) {
        newShop.cover_image = await this.attachmentRepository.findByIds(createShopDto.cover_image);
      }

      // Handle logo if provided
      newShop.logo = createShopDto.logo
        ? await this.attachmentRepository.findOne({ where: { id: createShopDto.logo.id } })
        : undefined;

      const shop = await this.shopRepository.save(newShop);

      // Handle balance logic
      if (createShopDto.balance) {
        const newBalance = this.balanceRepository.create({
          admin_commission_rate: createShopDto.balance.admin_commission_rate,
          current_balance: createShopDto.balance.current_balance,
          total_earnings: createShopDto.balance.total_earnings,
          withdrawn_amount: createShopDto.balance.withdrawn_amount,
          shop: shop,
        });

        if (createShopDto.balance.payment_info) {
          newBalance.payment_info = await this.paymentInfoRepository.save(
            this.paymentInfoRepository.create(createShopDto.balance.payment_info)
          );
        }

        const savedBalance = await this.balanceRepository.save(newBalance);
        shop.balance = savedBalance;
      }

      // Assign the shop to the user
      userToUpdate.shop_id = shop.id;
      userToUpdate.managed_shop = shop;
      await this.userRepository.save(userToUpdate);

      // Handle permissions if provided
      if (createShopDto.permission) {
        const permission = await this.permissionRepository.findOne({
          where: { permission_name: ILike(createShopDto.permission) as unknown as FindOperator<string> },
        });

        if (permission) {
          newShop.permission = permission;

          // Set dealerCount only if the user is of type Company
          if (permission.type_name === UserType.Company) {
            newShop.dealerCount = createShopDto.dealerCount || 0;
          }
        }
      }

      // Handle additional permissions if provided
      if (createShopDto.additionalPermissions?.length > 0) {
        const additionalPermissions = await this.permissionRepository.find({
          where: { permission_name: ILike(createShopDto.additionalPermissions) as unknown as FindOperator<string> },
        });

        if (additionalPermissions) {
          newShop.additionalPermissions = additionalPermissions;
        }
      }

      await this.shopRepository.save(newShop);

      // Fetch and return the created shop with balance relations
      const createdShop = await this.shopRepository.findOne({
        where: { id: shop.id },
        relations: ['balance'],
      });

      // Update analytics with the new shop
      await this.analyticsService.updateAnalytics(undefined, undefined, createdShop);

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

    // Construct a cache key based on the search, page, and limit parameters
    const cacheKey = `shops_${search || 'all'}_${page}_${limit}`;

    // Try to retrieve the data from the cache
    let data: Shop[] = await this.cacheManager.get<Shop[]>(cacheKey);

    if (!data) {
      // If the data is not in the cache, fetch it from the database
      data = await this.shopRepository.find({
        relations: [
          'balance',
          'balance.shop',
          'staffs',
          'owner',
          'owner.profile',
          'cover_image',
          'logo',
          'address',
          'settings',
          'settings.socials',
          'settings.location',
          'permission',
          'additionalPermissions',
          'additionalPermissions.permissions',
          'events',
          'regions',
        ],
      });


      // Apply search filtering if the search parameter is provided
      if (search) {
        const fuse = new Fuse(data, {
          keys: ['name', 'id', 'slug', 'is_active', 'address.city', 'address.state', 'address.country'],
          threshold: 0.7,
        });
        const searchResults = fuse.search(search);
        data = searchResults.map(({ item }) => item);
      }

      // Cache the results
      await this.cacheManager.set(cacheKey, data, 60); // Cache for 1 hour
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
      balance: shop.balance ? {
        id: shop.balance.id,
        admin_commission_rate: shop.balance.admin_commission_rate,
        total_earnings: shop.balance.total_earnings,
        withdrawn_amount: shop.balance.withdrawn_amount,
        current_balance: shop.balance.current_balance,
        shop: shop.balance.shop,
        dealer: null,
        payment_info: shop.balance.payment_info ? {
          id: shop.balance.payment_info.id,
          account: shop.balance.payment_info.account,
          name: shop.balance.payment_info.name,
          email: shop.balance.payment_info.email,
          bank: shop.balance.payment_info.bank,
        } : null,
      } : null,
      settings: shop.settings ? {
        id: shop.settings.id,
        contact: shop.settings.contact,
        website: shop.settings.website,
        socials: shop.settings.socials,
        location: shop.settings.location,
      } : null,
      address: shop.address ? {
        id: shop.address.id,
        street_address: shop.address.street_address,
        country: shop.address.country,
        city: shop.address.city,
        state: shop.address.state,
        zip: shop.address.zip,
      } : null,
      owner: shop.owner ? {
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
        permission: shop.owner.permission,
        walletPoints: shop.owner.walletPoints,
        contact: shop.owner.contact,
        email_verified_at: shop.owner.email_verified_at,
        profile: shop.owner.profile, // Update with actual profile data if available
      } : null,
      cover_image: shop.cover_image || [],
      logo: shop.logo ? {
        id: shop.logo.id || "",
        thumbnail: shop.logo.thumbnail || "",
        original: shop.logo.original || "",
      } : null,
      staffs: shop.staffs || [],
      additionalPermissions: shop.additionalPermissions || [],
      permission: shop.permission || null,
      // delaerCount: shop?.dealerCount || null,
    }));

    return {
      data: mappedResults as unknown as Shop[],
      ...paginate(data.length, page, limit, results.length, `/shops?search=${search}&limit=${limit}`),
    };
  }

  async getStaffs({ shop_id, limit, page, orderBy, sortedBy, createdBy }: GetStaffsDto): Promise<any> {
    const limitNum = limit && limit > 0 ? limit : 10;
    const pageNum = page && page > 0 ? page : 1;
    const startIndex = (pageNum - 1) * limitNum;

    if (!createdBy) {
      return {
        data: [],
        message: 'The "createdBy" parameter is required',
      };
    }

    // Validate createdBy exists in the database
    const creator = await this.userRepository.findOne({ where: { id: createdBy } });
    if (!creator) {
      return {
        data: [],
        message: 'Invalid "createdBy" parameter. No user found for the given ID.',
      };
    }

    // Generate a cache key using query parameters
    const cacheKey = `staffs_${shop_id}_${limit}_${page}_${orderBy}_${sortedBy}_${createdBy}`;

    // Attempt to retrieve the result from the cache
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Add relations and filters
    queryBuilder
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.adds', 'address') // Assuming 'adds' is for address relation
      .leftJoinAndSelect('user.permission', 'permission')
      .where('user.createdBy = :createdBy', { createdBy });

    // Filter by shop_id if provided
    if (shop_id) {
      queryBuilder.andWhere('user.shop_id = :shop_id', { shop_id });
    }

    // Ensure staff user type is selected
    const staffPermission = await this.permissionRepository.findOne({
      where: { type_name: UserType.Staff },
    });

    if (!staffPermission) {
      throw new NotFoundException('Staff permission type not found');
    }

    queryBuilder.andWhere('user.permission = :permission', { permission: staffPermission.id });

    // Pagination
    queryBuilder.skip(startIndex).take(limitNum);

    // Sorting
    if (orderBy && sortedBy) {
      const sortDirection = sortedBy.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder.addOrderBy(`user.${orderBy}`, sortDirection);
    }

    // Execute the query and retrieve data
    const [users, total] = await queryBuilder.getManyAndCount();
    const url = `/users?type=staff&limit=${limitNum}`;
    const result = {
      data: users,
      ...paginate(total, pageNum, limitNum, total, url),
    };

    // Cache the result for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300);

    return result;
  }

  async getShop(slug: string): Promise<Shop | null> {
    try {
      // Construct a unique cache key based on the shop slug
      const cacheKey = `shop_${slug}`;

      // Try to retrieve the shop data from the cache
      let existShop = await this.cacheManager.get<Shop>(cacheKey);

      if (!existShop) {
        // If the data is not in the cache, fetch it from the database
        existShop = await this.shopRepository.findOne({
          where: { slug: slug },
          relations: [
            'balance',
            'balance.payment_info',
            'settings',
            'address',
            'owner',
            'owner.profile',
            'cover_image',
            'logo',
            'staffs',
            'additionalPermissions',
            'additionalPermissions.permissions',
            'permission',
            'permission.permissions',
            'regions',
            'events',
          ],
        });

        // If the shop is not found, return null
        if (!existShop) {
          console.error('Shop Not Found');
          return null;
        }

        // Cache the fetched shop data for 1 hour (3600 seconds)
        await this.cacheManager.set(cacheKey, existShop, 60);
      }

      // Map the retrieved shop data to the desired structure
      const mappedShop: Shop = {
        id: existShop.id,
        owner_id: existShop.owner_id,
        name: existShop.name,
        slug: existShop.slug,
        description: existShop.description,
        balance: existShop.balance
          ? {
            id: existShop.balance.id,
            admin_commission_rate: existShop.balance.admin_commission_rate,
            total_earnings: existShop.balance.total_earnings,
            withdrawn_amount: existShop.balance.withdrawn_amount,
            current_balance: existShop.balance.current_balance,
            shop: existShop.balance.shop ?? null,
            dealer: null,
            payment_info: existShop.balance.payment_info
              ? {
                id: existShop.balance.payment_info.id,
                account: existShop.balance.payment_info.account,
                name: existShop.balance.payment_info.name,
                email: existShop.balance.payment_info.email,
                bank: existShop.balance.payment_info.bank,
              }
              : null,
          }
          : null,
        cover_image: existShop.cover_image ?? null,
        logo: existShop.logo
          ? {
            id: existShop.logo.id,
            original: existShop.logo.original,
            thumbnail: existShop.logo.thumbnail,
          }
          : null,
        is_active: existShop.is_active,
        address: existShop.address
          ? {
            id: existShop.address.id,
            street_address: existShop.address.street_address,
            country: existShop.address.country,
            city: existShop.address.city,
            state: existShop.address.state,
            zip: existShop.address.zip,
            customer_id: existShop.address.customer_id,
            created_at: existShop.address.created_at,
            updated_at: existShop.address.updated_at
          }
          : null,
        settings: existShop.settings
          ? {
            id: existShop.settings.id,
            contact: existShop.settings.contact,
            website: existShop.settings.website,
            socials: existShop.settings.socials,
            location: existShop.settings.location,
          }
          : null,
        created_at: existShop.created_at,
        updated_at: existShop.updated_at,
        orders_count: existShop.orders_count,
        products_count: existShop.products_count,
        owner: existShop.owner
          ? {
            ...existShop.owner,
            profile: existShop.owner.profile ?? null,
            walletPoints: existShop.owner.walletPoints ?? 0,
            contact: existShop.owner.contact ?? '',
          }
          : null,
        gst_number: existShop.gst_number ?? '',
        categories: existShop.categories ?? [],
        subCategories: existShop.subCategories ?? [],
        orders: existShop.orders ?? [],
        additionalPermissions: existShop.additionalPermissions ?? [],
        permission: existShop.permission ?? null,
        dealerCount: existShop?.dealerCount ?? 0,
        regions: existShop.regions ?? [],
        events: existShop.events ?? [],
      };

      return mappedShop;
    } catch (error) {
      // Log error details for debugging
      console.error(`Error fetching shop with slug '${slug}':`, error.message);
      return null;
    }
  }

  async update(id: number, updateShopDto: UpdateShopDto): Promise<Shop> {
    const existingShop = await this.shopRepository.findOne({
      where: { id: id },
      relations: ["balance", "address", "settings", "settings.socials", "settings.location",
        'permission',
        'permission.permissions', "owner"]
    });

    if (!existingShop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }

    // Store the IDs of the existing cover_image and logo attachments
    const existingCoverImageId = existingShop.cover_image;
    const existingLogoId = existingShop.logo;

    // Set the cover_image and logo fields in the shopRepository to null
    existingShop.cover_image = [];
    existingShop.logo = null;
    await this.shopRepository.save(existingShop);

    // Remove existing cover_image and logo attachments
    if (existingCoverImageId) {
      // Remove existing cover_image attachments
      if (existingCoverImageId.length > 0) {
        await this.attachmentRepository.remove(existingCoverImageId);
      }
    }

    if (existingLogoId) {
      await this.attachmentRepository.delete(existingLogoId);
    }

    // Set dealerCount only if the user is of type Company
    if (existingShop.permission.type_name === UserType.Company) {
      // existingShop.dealerCount = updateShopDto?.dealerCount || 0;
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
      const userAdd = new UserAdd()
      userAdd.city = updateShopDto.address.city;
      userAdd.country = updateShopDto.address.country;
      userAdd.customer_id = existingShop?.owner.id;
      userAdd.state = updateShopDto.address.state;
      userAdd.street_address = updateShopDto.address.street_address;
      userAdd.zip = updateShopDto.address?.zip;
      userAdd.created_at = updateShopDto.address.created_at;
      userAdd.updated_at = updateShopDto.address.updated_at;
      const updatedAddress = await this.userAddressRepository.save(userAdd)

      const address = new Add()
      address.address = updatedAddress;
      address.title = `${updateShopDto.address.street_address + " " + updateShopDto.address.city + " " + updateShopDto.address.state}`
      address.customer = existingShop?.owner;
      address.default = true;
      address.type = AddressType.SHOP;
      this.addressRepository.save(address)
      existingShop.address = await this.userAddressRepository.save({ ...existingShop.address, ...updatedAddress });
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
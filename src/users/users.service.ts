/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, InternalServerErrorException, Inject } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto, UserPaginator } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import Fuse from 'fuse.js';
import { User, UserType } from './entities/user.entity';
import { paginate } from 'src/common/pagination/paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile, Social } from './entities/profile.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { DealerDto } from './dto/add-dealer.dto';
import { Dealer, DealerCategoryMargin, DealerProductMargin } from './entities/dealer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { RegisterDto } from 'src/auth/dto/create-auth.dto';
import { AuthService } from 'src/auth/auth.service';
import { Brackets, Equal, FindManyOptions, FindOptionsWhere, In, Like, Repository, SelectQueryBuilder } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Add } from '../address/entities/address.entity';
import { AddressesService } from '../address/addresses.service';
import { CreateAddressDto } from '../address/dto/create-address.dto';
import { UpdateAddressDto } from '../address/dto/update-address.dto';

const options = {
  keys: ['name', 'type.slug', 'categories.slug', 'status'],
  threshold: 0.3,
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Add) private readonly addressRepository: Repository<Add>,
    @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Attachment) private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Dealer) private readonly dealerRepository: Repository<Dealer>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(DealerProductMargin) private readonly dealerProductMarginRepository: Repository<DealerProductMargin>,
    @InjectRepository(DealerCategoryMargin) private readonly dealerCategoryMarginRepository: Repository<DealerCategoryMargin>,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Social) private readonly socialRepository: Repository<Social>,
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

    private readonly authService: AuthService,
    private readonly addressesService: AddressesService,

  ) { }

  //------------------------------ User service -------------------------- 

  async create(createUserDto: CreateUserDto) {

    const user = await this.userRepository.findOne({ where: { email: createUserDto.email }, relations: ['permission'] })
    if (user) {
      throw new NotFoundException(`User with email ${createUserDto.email} already exists`);
    }

    const registerDto = new RegisterDto();
    registerDto.name = createUserDto.name;
    registerDto.email = createUserDto.email;
    registerDto.password = createUserDto.password;
    registerDto.isVerified = createUserDto.isVerified;
    registerDto.permission = createUserDto.permission;

    await this.authService.register(registerDto);

    const usr = new User();
    const shop = await this.shopRepository.findOne({ where: { id: createUserDto.managed_shop?.id } });
    if (shop) {
      usr.shop_id = createUserDto.managed_shop?.id;
    }
    usr.is_active = createUserDto.is_active;
    usr.permission = createUserDto.permission;
    usr.created_at = new Date();

    await this.userRepository.save(usr);

    if (Array.isArray(createUserDto.address)) {
      for (const addressData of createUserDto.address) {
        const createAddressDto = new CreateAddressDto();
        createAddressDto.title = addressData.title;
        createAddressDto.type = addressData.type;
        createAddressDto.default = addressData.default;
        createAddressDto.address = addressData.address;
        createAddressDto.customer_id = usr.id;
        await this.addressesService.create(createAddressDto);
      }
    }

    const social = new Social();
    social.link = createUserDto.profile.socials.link;
    social.type = createUserDto.profile.socials.type;
    await this.socialRepository.save(social);

    const profile = new Profile();
    profile.customer = usr;
    profile.socials = social;
    profile.bio = createUserDto.profile.bio;
    profile.contact = createUserDto.profile.contact;

    let profUsr = await this.profileRepository.save(profile);
    usr.profile = profUsr

    await this.userRepository.save(usr);
    return usr;
  }

  async getUsers({
    searchJoin = 'and',
    with: include,
    limit = 30,
    page = 1,
    name,
    orderBy,
    sortedBy,
    usrById,
    search,
    type,
  }: GetUsersDto): Promise<UserPaginator> {

    const limitNum = limit;
    const pageNum = page;
    const startIndex = (pageNum - 1) * limitNum;

    // Construct a cache key based on query parameters
    const cacheKey = `users_${JSON.stringify({
      searchJoin,
      include,
      limit,
      page,
      name,
      orderBy,
      sortedBy,
      usrById,
      search,
      type,
    })}`;

    // Try to get cached data
    const cachedData = await this.cacheManager.get<UserPaginator>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    let user;
    if (usrById) {
      // Fetch user by ID and apply type-based filtering if provided
      user = await this.userRepository.findOne({
        where: { id: Number(usrById) },
        relations: [
          'profile',
          'dealer',
          'owned_shops',
          'inventoryStocks',
          'stocks',
          'managed_shop',
          'address',
          'orders',
          'stocksSellOrd',
          'permission',
        ],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${usrById} not found`);
      }
    }

    const queryBuilder: SelectQueryBuilder<User> = this.userRepository.createQueryBuilder('user');

    // Adding relations
    queryBuilder
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.dealer', 'dealer')
      .leftJoinAndSelect('user.owned_shops', 'owned_shops')
      .leftJoinAndSelect('user.inventoryStocks', 'inventoryStocks')
      .leftJoinAndSelect('user.stocks', 'stocks')
      .leftJoinAndSelect('user.managed_shop', 'managed_shop')
      .leftJoinAndSelect('user.address', 'address')
      .leftJoinAndSelect('user.orders', 'orders')
      .leftJoinAndSelect('user.stocksSellOrd', 'stocksSellOrd')
      .leftJoinAndSelect('user.permission', 'permission');

    // Pagination
    queryBuilder.skip(startIndex).take(limitNum);

    // Ordering
    if (orderBy && sortedBy) {
      queryBuilder.addOrderBy(`user.${orderBy}`, sortedBy.toUpperCase() as 'ASC' | 'DESC');
    }

    // Filtering by usrById and type
    if (usrById) {
      queryBuilder.andWhere('user.createdById = :usrById', { usrById });

      if (type) {
        const permissions = await this.permissionRepository.find({
          where: { type_name: type, user: Number(usrById) },
        });
        if (permissions.length === 0) {
          throw new NotFoundException(`Permission for type "${type}" not found.`);
        }

        const permissionIds = permissions.map((p) => p.id);
        queryBuilder.andWhere('user.permission_id IN (:...permissionIds)', { permissionIds });
      }
    }

    // Filtering by name
    if (name) {
      queryBuilder.andWhere('user.name LIKE :name', { name: `%${name}%` });
    }

    // Search filter query
    if (search) {
      const searchConditions = [];
      const searchParams = {};

      const filterTerms = search.split(' ');
      filterTerms.forEach((term, index) => {
        const searchTermKey = `searchTerm${index}`;
        const searchTermValue = `%${term}%`;
        searchConditions.push(
          `(user.name LIKE :${searchTermKey} OR user.email LIKE :${searchTermKey} OR user.contact LIKE :${searchTermKey})`
        );
        searchParams[searchTermKey] = searchTermValue;
      });

      if (searchJoin.toLowerCase() === 'or') {
        queryBuilder.andWhere(new Brackets(qb => {
          qb.where(searchConditions.join(' OR '), searchParams);
        }));
      } else {
        searchConditions.forEach((condition, index) => {
          queryBuilder.andWhere(condition, searchParams);
        });
      }
    }

    // Execute the query and get results
    const [users, total] = await queryBuilder.getManyAndCount();

    // Prepare paginated response
    const isCompanyOrStaff = user && (user.permission.type_name === UserType.Company || user.permission.type_name === UserType.Staff);
    const url = `/users?type=${type || 'customer'}&limit=${limitNum}`;

    const result = {
      data: isCompanyOrStaff ? [...users] : [user, ...users],
      ...paginate(total, pageNum, limitNum, total, url),
    };

    // Cache the result
    await this.cacheManager.set(cacheKey, result, 3600); // Cache for 1 hour

    return result;
  }

  async findOne(id: number): Promise<User> {
    // Construct a cache key based on the user ID
    const cacheKey = `user_${id}`;

    // Try to get cached data
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    // Fetch user from the database if not cached
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['profile', 'address', 'owned_shops', 'orders', 'address.address', 'permission'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Cache the result
    await this.cacheManager.set(cacheKey, user, 3600); // Cache for 1 hour

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: id }, relations: ["profile", "address", "address.address", "owned_shops", "orders", "profile.socials", "permission"]
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Update the user properties
    user.name = updateUserDto.name || user.name;
    user.email = updateUserDto.email || user.email;
    user.password = updateUserDto.password || user.password;
    user.isVerified = updateUserDto.isVerified !== undefined ? updateUserDto.isVerified : user.isVerified;
    user.is_active = updateUserDto.is_active !== undefined ? updateUserDto.is_active : user.is_active;
    user.permission = updateUserDto.permission || user.permission;

    // Check if the shop exists in the ShopRepository
    const shop = await this.shopRepository.findOne({ where: { id: updateUserDto.managed_shop?.id } });
    if (shop) {
      user.shop_id = updateUserDto.managed_shop?.id;
    }

    // Save the updated user
    await this.userRepository.save(user);

    if (Array.isArray(updateUserDto.address)) {
      for (const addressData of updateUserDto.address) {
        let address;
        if (addressData.address.id) {
          address = await this.addressRepository.findOne({ where: { id: addressData.address.id } });
        }
        if (address) {
          const updateAddressDto = new UpdateAddressDto();
          updateAddressDto.title = addressData.title;
          updateAddressDto.type = addressData.type;
          updateAddressDto.default = addressData.default;
          updateAddressDto.address = addressData.address;
          await this.addressesService.update(addressData.address.id, updateAddressDto);
        } else {
          const createAddressDto = new CreateAddressDto();
          createAddressDto.title = addressData.title;
          createAddressDto.type = addressData.type;
          createAddressDto.default = addressData.default;
          createAddressDto.address = addressData.address;
          createAddressDto.customer_id = id;
          await this.addressesService.create(createAddressDto);
        }
      }
    }

    // Find the profile by customer id
    let profile = await this.profileRepository.findOne({ where: { customer: { id } } });

    // If the profile does not exist, create a new one
    if (!profile) {
      profile = new Profile();
      profile.customer = user;
      profile.bio = updateUserDto.profile.bio;
      profile.contact = updateUserDto.profile.contact;
    }

    // Update and save the socials
    if (updateUserDto.profile && updateUserDto.profile.socials) {
      let social = await this.socialRepository.findOne({ where: { id: profile.socials?.id } });
      if (social) {
        social.type = updateUserDto.profile.socials.type || social.type;
        social.link = updateUserDto.profile.socials.link || social.link;
      } else {
        social = new Social();
        social.type = updateUserDto.profile.socials.type;
        social.link = updateUserDto.profile.socials.link;
      }
      await this.socialRepository.save(social);
      profile.socials = social;
    }

    // Save the profile
    await this.profileRepository.save(profile);


    return user;
  }

  async removeUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id }, relations: ["profile", "address", "owned_shops", "orders", "permission"]
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // First, remove the related entities
    await Promise.all(user.address.map(address => this.addressesService.remove(address.id)));
    await this.profileRepository.remove(user.profile);
    await this.shopRepository.remove(user.owned_shops);
    // await this.ordersRepository.remove(user.orders);

    // Then, remove the user
    await this.userRepository.remove(user);

    return `User with id ${id} has been removed`;
  }


  async makeAdmin(user_id: number) {
    const user = await this.userRepository.findOne({ where: { id: user_id }, relations: ['permission'] });

    if (!user) {
      throw new NotFoundException(`User with id ${user_id} not found`);
    }

    const usr_type = await this.permissionRepository.findOne({ where: { user: user.id } })

    usr_type.type_name = UserType.Staff;

    await this.userRepository.save(user);

    return user;
  }


  async banUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id: id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    user.is_active = false;

    await this.userRepository.save(user);

    return user;
  }



  async activeUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id: id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    user.is_active = !user.is_active;

    await this.userRepository.save(user);

    return user;
  }

  // -------------------------------Dealer Services----------------------
  async createDealer(dealerData: DealerDto) {
    // Check if the user exists and is of type 'Dealer'
    const user = await this.userRepository.findOne({ where: { id: dealerData.user.id }, relations: ['permission'] });

    if (!user || user.permission.type_name !== UserType.Dealer) {
      throw new NotFoundException(`User with ID ${dealerData.user.id} not found or is not a Dealer`);
    }

    // Create a new dealer instance and assign values from the DTO
    const dealer = new Dealer();
    dealer.name = dealerData.name;
    dealer.phone = dealerData.phone;
    dealer.subscriptionType = dealerData.subscriptionType;
    dealer.subscriptionStart = dealerData.subscriptionStart;
    dealer.subscriptionEnd = dealerData.subscriptionEnd;
    dealer.discount = dealerData.discount;
    dealer.walletBalance = dealerData.walletBalance;
    dealer.isActive = dealerData.isActive;
    dealer.gst = dealerData.gst;
    dealer.pan = dealerData.pan;

    // Set the user relation in the dealer
    dealer.user = user;

    // Save the dealer entity to generate an ID
    const savedDealer = await this.dealerRepository.save(dealer);

    // Update the user's dealer relation
    user.dealer = savedDealer;
    await this.userRepository.save(user);

    // Iterate over dealerProductMargins and save each
    for (const marginData of dealerData.dealerProductMargins) {
      // Assuming marginData.product is properly defined elsewhere
      const product = await this.productRepository.findOne({ where: { id: marginData.product.id } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${marginData.product.id} not found`);
      }
      const margin = new DealerProductMargin();
      margin.product = product;
      margin.margin = marginData.margin;
      margin.isActive = marginData.isActive;
      margin.dealer = savedDealer;
      await this.dealerProductMarginRepository.save(margin);
    }

    // Iterate over dealerCategoryMargins and save each
    for (const marginData of dealerData.dealerCategoryMargins) {
      // Assuming marginData.category is properly defined elsewhere
      const category = await this.categoryRepository.findOne({ where: { id: marginData.category.id } });
      if (!category) {
        throw new NotFoundException(`Category with ID ${marginData.category.id} not found`);
      }
      const margin = new DealerCategoryMargin();
      margin.category = category;
      margin.margin = marginData.margin;
      margin.isActive = marginData.isActive;
      margin.dealer = savedDealer;
      await this.dealerCategoryMarginRepository.save(margin);
    }

    // Remove circular references
    delete savedDealer.user.dealer;

    return savedDealer;
  }

  async getAllDealers(createdBy?: number): Promise<Dealer[]> {
    const cacheKey = `dealers_${createdBy || 'all'}`;
    let dealers = await this.cacheManager.get<Dealer[]>(cacheKey);

    if (!dealers) {
      const findOptions = {
        relations: [
          'user',
          'dealerProductMargins',
          'dealerProductMargins.product',
          'dealerCategoryMargins',
          'dealerCategoryMargins.category'
        ],
      };

      if (createdBy) {
        const user = await this.userRepository.findOne({ where: { id: createdBy } });
        if (!user) {
          throw new NotFoundException(`User with ID ${createdBy} not found`);
        }

        findOptions['where'] = { user: { createdBy: { id: createdBy } } };
      }

      dealers = await this.dealerRepository.find(findOptions);

      // Cache the results
      await this.cacheManager.set(cacheKey, dealers, 3600);
    }

    return dealers;
  }

  async getDealerById(id: number): Promise<Dealer> {
    const cacheKey = `dealer_${id}`;
    let dealer = await this.cacheManager.get<Dealer>(cacheKey);

    if (!dealer) {
      dealer = await this.dealerRepository.findOne({
        where: { user: { id } },
        relations: [
          'user',
          'dealerProductMargins',
          'dealerProductMargins.product',
          'dealerCategoryMargins',
          'dealerCategoryMargins.category',
        ],
      });

      if (!dealer) {
        throw new NotFoundException(`Dealer with user ID ${id} not found`);
      }

      // Cache the result
      await this.cacheManager.set(cacheKey, dealer, 3600);
    }

    return dealer;
  }

  async updateDealer(id: number, dealerData: DealerDto): Promise<Dealer> {
    const dealer = await this.dealerRepository.findOne({ where: { id: id }, relations: ['user', 'dealerProductMargins', 'dealerProductMargins.product', 'dealerCategoryMargins', 'dealerCategoryMargins.category'] });
    if (!dealer) {
      throw new NotFoundException(`Dealer with ID ${id} not found`);
    }

    // Update dealer properties
    dealer.name = dealerData.name;
    dealer.phone = dealerData.phone;
    dealer.subscriptionType = dealerData.subscriptionType;
    dealer.subscriptionStart = dealerData.subscriptionStart;
    dealer.subscriptionEnd = dealerData.subscriptionEnd;
    dealer.discount = dealerData.discount;
    dealer.walletBalance = dealerData.walletBalance;
    dealer.isActive = dealerData.isActive;
    dealer.gst = dealerData.gst
    dealer.pan = dealerData.pan

    // Update or create new DealerProductMargin
    for (const marginData of dealerData.dealerProductMargins) {
      if (!marginData.product || !marginData.product.id) continue;  // Skip if product or product.id is not provided
      let margin = dealer.dealerProductMargins.find(m => m.product.id === marginData.product.id);
      if (!margin) {
        margin = new DealerProductMargin();
        margin.product = await this.productRepository.findOne({ where: { id: marginData.product.id } });
        margin.dealer = dealer;  // Associate the margin with the dealer
        dealer.dealerProductMargins.push(margin);
      }
      margin.margin = marginData.margin;
      margin.isActive = marginData.isActive;
      await this.dealerProductMarginRepository.save(margin);  // Save the margin
    }

    // Find and remove DealerProductMargin not present in the update data
    const existingProductMarginIds = dealer.dealerProductMargins.map(m => m.product.id);
    const updateProductMarginIds = dealerData.dealerProductMargins.map(md => md.product && md.product.id);
    const productMarginIdsToRemove = existingProductMarginIds.filter(id => !updateProductMarginIds.includes(id));

    for (const id of productMarginIdsToRemove) {
      const marginToRemove = dealer.dealerProductMargins.find(m => m.product.id === id);
      await this.dealerProductMarginRepository.remove(marginToRemove);
    }

    // Update or create new DealerCategoryMargin
    for (const marginData of dealerData.dealerCategoryMargins) {
      if (!marginData.category || !marginData.category.id) continue;  // Skip if category or category.id is not provided
      let margin = dealer.dealerCategoryMargins.find(m => m.category.id === marginData.category.id);
      if (!margin) {
        margin = new DealerCategoryMargin();
        margin.category = await this.categoryRepository.findOne({ where: { id: marginData.category.id } });
        margin.dealer = dealer;  // Associate the margin with the dealer
        dealer.dealerCategoryMargins.push(margin);
      }
      margin.margin = marginData.margin;
      margin.isActive = marginData.isActive;
      await this.dealerCategoryMarginRepository.save(margin);  // Save the margin
    }

    // Find and remove DealerCategoryMargin not present in the update data
    const existingCategoryMarginIds = dealer.dealerCategoryMargins.map(m => m.category.id);
    const updateCategoryMarginIds = dealerData.dealerCategoryMargins.map(md => md.category && md.category.id);
    const categoryMarginIdsToRemove = existingCategoryMarginIds.filter(id => !updateCategoryMarginIds.includes(id));

    for (const id of categoryMarginIdsToRemove) {
      const marginToRemove = dealer.dealerCategoryMargins.find(m => m.category.id === id);
      await this.dealerCategoryMarginRepository.remove(marginToRemove);
    }

    // Remove circular references
    dealer.dealerProductMargins.forEach(margin => {
      delete margin.dealer;
    });
    dealer.dealerCategoryMargins.forEach(margin => {
      delete margin.dealer;
    });

    return this.dealerRepository.save(dealer);
  }

  async deleteDealer(id: number): Promise<void> {
    const dealer = await this.dealerRepository.findOne({ where: { user: { id } }, relations: ['user', 'dealerProductMargins', 'dealerCategoryMargins'] });
    if (!dealer) {
      throw new NotFoundException(`Dealer with ID ${id} not found`);
    }

    // Remove the dealer product margins
    for (const margin of dealer.dealerProductMargins) {
      await this.dealerProductMarginRepository.delete(margin.id);
    }

    // Remove the dealer category margins
    for (const margin of dealer.dealerCategoryMargins) {
      await this.dealerCategoryMarginRepository.delete(margin.id);
    }

    // Remove circular references
    dealer.dealerProductMargins.forEach(margin => {
      delete margin.dealer;
    });
    dealer.dealerCategoryMargins.forEach(margin => {
      delete margin.dealer;
    });

    await this.dealerRepository.delete(dealer.id);
  }


  // ------------------------- Profile Service ----------------------------------------

  async createProfile(createProfileDto: CreateProfileDto): Promise<Profile> {


    return
  }

  async updateProfile(updateProfileDto: UpdateProfileDto): Promise<Profile> {

    return
  }
}

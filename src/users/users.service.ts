import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto, UserPaginator } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import Fuse from 'fuse.js';

import { User, UserType } from './entities/user.entity';
import usersJson from '@db/users.json';
import { paginate } from 'src/common/pagination/paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { DealerCategoryMarginRepository, DealerProductMarginRepository, DealerRepository, SocialRepository, UserRepository } from './users.repository';
import { DeepPartial, FindOneOptions, FindOperator, Repository } from 'typeorm';
import { Address } from 'src/addresses/entities/address.entity';
import { Profile, Social } from './entities/profile.entity';
import { AddressRepository } from 'src/addresses/addresses.repository';
import { ProfileRepository } from './profile.repository';
import { AttachmentRepository } from 'src/common/common.repository';
import { Attachment } from 'src/common/entities/attachment.entity';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { DealerDto } from './dto/add-dealer.dto';
import { Dealer, DealerCategoryMargin, DealerProductMargin } from './entities/dealer.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductRepository } from 'src/products/products.repository';
import { Category } from 'src/categories/entities/category.entity';
import { CategoryRepository } from 'src/categories/categories.repository';
import { Shop } from 'src/shops/entities/shop.entity';
import { ShopRepository } from 'src/shops/shops.repository';
import { RegisterDto } from 'src/auth/dto/create-auth.dto';
import { AuthService } from 'src/auth/auth.service';

const users = plainToClass(User, usersJson);

const options = {
  keys: ['name', 'type.slug', 'categories.slug', 'status'],
  threshold: 0.3,
};
const fuse = new Fuse(users, options);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: UserRepository,
    @InjectRepository(Address) private readonly addressesRepository: AddressRepository,
    @InjectRepository(Profile) private readonly profilesRepository: ProfileRepository,
    @InjectRepository(Attachment) private readonly attachmentRepository: AttachmentRepository,
    @InjectRepository(Dealer) private readonly dealerRepository: DealerRepository,
    @InjectRepository(Product) private readonly productRepository: ProductRepository,
    @InjectRepository(Category) private readonly categoryRepository: CategoryRepository,
    @InjectRepository(DealerProductMargin) private readonly dealerProductMarginRepository: DealerProductMarginRepository,
    @InjectRepository(DealerCategoryMargin) private readonly dealerCategoryMarginRepository: DealerCategoryMarginRepository,
    @InjectRepository(Shop) private readonly shopRepository: ShopRepository,
    @InjectRepository(Social) private readonly socialRepository: SocialRepository,
    private authService: AuthService

  ) { }

  //-------------------------------------------------------- 

  private users: User[] = users;

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({ where: { email: createUserDto.email } })

    if (user) {
      throw new NotFoundException(`User with email ${createUserDto.email} already exists`);
    }

    const usr = new User();
    usr.name = createUserDto.name;
    usr.email = createUserDto.email;
    usr.password = createUserDto.password;
    usr.isVerified = createUserDto.isVerified;

    // Check if the shop exists in the ShopRepository
    const shop = await this.shopRepository.findOne({ where: { id: createUserDto.managed_shop?.id } });
    if (shop) {
      usr.shop_id = createUserDto.managed_shop?.id;
    }

    usr.is_active = createUserDto.is_active;
    usr.type = createUserDto.type;
    usr.createdAt = new Date();

    // Save the user first to generate an ID
    await this.userRepository.save(usr);

    // Then save the addresses
    for (const addressData of createUserDto.address) {
      const address = new Address();
      // Set the properties of the address here
      address.customer = usr;  // Associate the address with the user
      await this.addressesRepository.save(address);  // Save the address
    }

    // Create and save the socials
    const social = new Social();
    // Set the properties of the social here
    await this.socialRepository.save(social);  // Save the social

    // And the profile
    const profile = new Profile();
    // Set the properties of the profile here
    profile.customer = usr;  // Associate the profile with the user
    profile.socials = social;  // Associate the socials with the profile
    await this.profilesRepository.save(profile);  // Save the profile

    return usr;
  }

  async getUsers({
    text,
    limit,
    page,
    search,
    type,  // Add 'type' to the parameters
  }: GetUsersDto): Promise<UserPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Get users from the custom repository
    let data: User[] = await this.userRepository.find({ relations: ["profile", "address", "shops", "orders"] });

    // Filter users by type if it's provided, or default to 'customer'
    data = data.filter(user => user.type === (type || 'customer'));

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          });
        }
      }

      data = fuse
        .search({
          $and: searchText,
        })
        ?.map(({ item }) => item);
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/users?type=${type || 'customer'}&limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getUsersNotify({ limit }: GetUsersDto): Promise<User[]> {
    const data = await this.userRepository.find({
      take: limit
    });

    return data;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: id }, relations: ["profile", "address", "shops", "orders"] });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: id }, relations: ["profile", "address", "shops", "orders", "profile.socials"]
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
    user.type = updateUserDto.type || user.type;

    // Check if the shop exists in the ShopRepository
    const shop = await this.shopRepository.findOne({ where: { id: updateUserDto.managed_shop?.id } });
    if (shop) {
      user.shop_id = updateUserDto.managed_shop?.id;
    }

    // Save the updated user
    await this.userRepository.save(user);

    // Then update or add the addresses
    for (const addressData of updateUserDto.address) {
      let address = await this.addressesRepository.findOne({ where: { id: addressData.address.id } });
      if (address) {
        // Update the properties of the address
        address.title = addressData.title;
        address.type = addressData.type;
        address.default = addressData.default;
        address.address = addressData.address;
      } else {
        address = new Address();
        // Set the properties of the address
        address.title = addressData.title;
        address.type = addressData.type;
        address.default = addressData.default;
        address.address = addressData.address;
        address.customer = user;  // Associate the address with the user
      }
      await this.addressesRepository.save(address);  // Save the updated or new address
    }

    // Update and save the socials
    const social = await this.socialRepository.findOne({ where: { id: user.profile.socials.id } });
    if (social) {
      // Update the properties of the social here
      await this.socialRepository.save(social);  // Save the updated social
    }

    // Update and save the profile
    const profile = await this.profilesRepository.findOne({ where: { id: user.profile.id } });
    if (profile) {
      // Update the properties of the profile here
      profile.socials = social || profile.socials;  // Update the socials of the profile
      await this.profilesRepository.save(profile);  // Save the updated profile
    }

    return user;
  }


  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id }, relations: ["profile", "address", "shops", "orders"]
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // First, remove the user
    await this.userRepository.remove(user);

    // Then remove the related entities
    await this.profilesRepository.remove(user.profile);
    await this.addressesRepository.remove(user.address);
    await this.shopRepository.remove(user.shops);
    // await this.ordersRepository.remove(user.orders);

    return `User with id ${id} has been removed`;
  }

  async makeAdmin(user_id: number) {
    const user = await this.userRepository.findOne({ where: { id: user_id } });

    if (!user) {
      throw new NotFoundException(`User with id ${user_id} not found`);
    }

    user.type = UserType.Admin;

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
    // Register the user first
    const registerDto = new RegisterDto();
    registerDto.name = dealerData.user.name;
    registerDto.email = dealerData.user.email;
    registerDto.password = dealerData.user.password;
    const registerResponse = await this.authService.register(registerDto);

    // If registration is successful, the user will be saved in the database
    const user = await this.userRepository.findOne({ where: { email: dealerData.user.email } });

    if (!user || user.type !== UserType.Dealer) {
      throw new NotFoundException(`User with email ${dealerData.user.email} not found or not a dealer`);
    }

    const dealer = new Dealer();
    dealer.name = dealerData.name;
    dealer.user = user;
    dealer.subscriptionType = dealerData.subscriptionType;
    dealer.subscriptionStart = dealerData.subscriptionStart;
    dealer.subscriptionEnd = dealerData.subscriptionEnd;
    dealer.discount = dealerData.discount;
    dealer.walletBalance = dealerData.walletBalance;
    dealer.isActive = dealerData.isActive;

    // Save the dealer first to generate an ID
    await this.dealerRepository.save(dealer);

    // Then save the dealer product margins
    for (const marginData of dealerData.dealerProductMargins) {
      const product = await this.productRepository.findOne({ where: { id: marginData.product.id } });
      const margin = new DealerProductMargin();
      margin.product = product;
      margin.margin = marginData.margin;
      margin.isActive = marginData.isActive;
      margin.dealer = dealer;  // Associate the margin with the dealer
      await this.dealerProductMarginRepository.save(margin);  // Save the margin
    }

    // And the dealer category margins
    for (const marginData of dealerData.dealerCategoryMargins) {
      const category = await this.categoryRepository.findOne({ where: { id: marginData.category.id } });
      const margin = new DealerCategoryMargin();
      margin.category = category;
      margin.margin = marginData.margin;
      margin.isActive = marginData.isActive;
      margin.dealer = dealer;  // Associate the margin with the dealer
      await this.dealerCategoryMarginRepository.save(margin);  // Save the margin
    }

    return dealer;
  }


  async getAllDealers(): Promise<Dealer[]> {
    return this.dealerRepository.find({ relations: ['user', 'dealerProductMargins', 'dealerProductMargins.product', 'dealerCategoryMargins', 'dealerCategoryMargins.category'] });
  }

  async getDealerById(id: number): Promise<Dealer> {
    return this.dealerRepository.findOne({
      where: { id: id },
      relations: ['user', 'dealerProductMargins', 'dealerProductMargins.product', 'dealerCategoryMargins', 'dealerCategoryMargins.category']
    });
  }

  async updateDealer(id: number, dealerData: DealerDto): Promise<Dealer> {
    const dealer = await this.dealerRepository.findOne({ where: { id: id }, relations: ['user', 'dealerProductMargins', 'dealerProductMargins.product', 'dealerCategoryMargins', 'dealerCategoryMargins.category'] });
    if (!dealer) {
      throw new NotFoundException(`Dealer with ID ${id} not found`);
    }

    dealer.name = dealerData.name;
    dealer.subscriptionType = dealerData.subscriptionType;
    dealer.subscriptionStart = dealerData.subscriptionStart;
    dealer.subscriptionEnd = dealerData.subscriptionEnd;
    dealer.discount = dealerData.discount;
    dealer.walletBalance = dealerData.walletBalance;
    dealer.isActive = dealerData.isActive;

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
    const dealer = await this.dealerRepository.findOne({ where: { id: id }, relations: ['dealerProductMargins', 'dealerCategoryMargins'] });
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

    await this.dealerRepository.delete(id);
  }

}


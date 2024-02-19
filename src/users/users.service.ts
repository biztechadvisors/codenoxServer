/* eslint-disable prettier/prettier */
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
import { AddressesService } from 'src/addresses/addresses.service';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';
import { UpdateAddressDto } from 'src/addresses/dto/update-address.dto';
import { Equal, FindManyOptions, FindOptionsWhere } from 'typeorm';

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
    @InjectRepository(Address) private readonly addressRepository: AddressRepository,
    @InjectRepository(Profile) private readonly profileRepository: ProfileRepository,
    @InjectRepository(Attachment) private readonly attachmentRepository: AttachmentRepository,
    @InjectRepository(Dealer) private readonly dealerRepository: DealerRepository,
    @InjectRepository(Product) private readonly productRepository: ProductRepository,
    @InjectRepository(Category) private readonly categoryRepository: CategoryRepository,
    @InjectRepository(DealerProductMargin) private readonly dealerProductMarginRepository: DealerProductMarginRepository,
    @InjectRepository(DealerCategoryMargin) private readonly dealerCategoryMarginRepository: DealerCategoryMarginRepository,
    @InjectRepository(Shop) private readonly shopRepository: ShopRepository,
    @InjectRepository(Social) private readonly socialRepository: SocialRepository,
    private readonly authService: AuthService,
    private readonly addressesService: AddressesService,

  ) { }

  //-------------------------------------------------------- 

  async create(createUserDto: CreateUserDto) {

    const user = await this.userRepository.findOne({ where: { email: createUserDto.email } })
    if (user) {
      throw new NotFoundException(`User with email ${createUserDto.email} already exists`);
    }

    const registerDto = new RegisterDto();
    registerDto.name = createUserDto.name;
    registerDto.email = createUserDto.email;
    registerDto.password = createUserDto.password;
    registerDto.isVerified = createUserDto.isVerified;
    registerDto.type = createUserDto.type ? createUserDto.type : UserType.Customer;

    await this.authService.register(registerDto);

    const usr = new User();
    const shop = await this.shopRepository.findOne({ where: { id: createUserDto.managed_shop?.id } });
    if (shop) {
      usr.shop_id = createUserDto.managed_shop?.id;
    }
    usr.is_active = createUserDto.is_active;
    usr.type = createUserDto.type;
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
    await this.profileRepository.save(profile);

    return usr;
  }

  async getUsers({
    text,
    limit,
    page,
    search,
    usrById,
    type,
  }: GetUsersDto): Promise<UserPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let data: User[];

    if (usrById) {
      const user = await this.userRepository.findOne({ where: { id: Number(usrById) } });

      if (user) {
        data = await this.userRepository.find({ where: { UsrBy: Equal(user.id) }, relations: ["dealer", "profile", "address", "shops", "orders", "address.address"] });
      } else {
        // Handle the case where usrById doesn't correspond to any user
        data = [];
      }
    } else {
      // If usrById is not provided, return all users
      const findOptions = {
        skip: startIndex,
        take: limit,
      };

      data = await this.userRepository.find(findOptions);
    }

    if (search) {
      const searchKey = search.split(':')[0];
      const searchValue = search.split(':')[1];

      data = await this.userRepository
        .createQueryBuilder("user")
        .where(`user.${searchKey} LIKE :searchValue`, { searchValue: `%${searchValue}%` })
        .getMany();
    }

    return {
      data,
      ...paginate(data.length, page, limit, data.length, `/users?type=${type || 'customer'}&limit=${limit}`),
    };
  }


  async getUsersNotify({ limit }: GetUsersDto): Promise<User[]> {
    const data = await this.userRepository.find({
      take: limit
    });
    return data;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: id }, relations: ["profile", "address", "shops", "orders", "address.address"] });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: id }, relations: ["profile", "address", "address.address", "shops", "orders", "profile.socials"]
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
      where: { id: id }, relations: ["profile", "address", "shops", "orders"]
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // First, remove the related entities
    await Promise.all(user.address.map(address => this.addressesService.remove(address.id)));
    await this.profileRepository.remove(user.profile);
    await this.shopRepository.remove(user.shops);
    // await this.ordersRepository.remove(user.orders);

    // Then, remove the user
    await this.userRepository.remove(user);

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
    const user = await this.userRepository.findOne({ where: { id: dealerData.user.id } });

    if (!user && user.type === UserType.Dealer) {
      throw new NotFoundException(`User with ID ${dealerData.user} not found`);
    }

    const dealer = new Dealer();
    dealer.name = dealerData.name;
    dealer.phone = dealerData.phone;
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
      where: { user: { id } },
      relations: ['user', 'dealerProductMargins', 'dealerProductMargins.product', 'dealerCategoryMargins', 'dealerCategoryMargins.category']
    });
  }

  async updateDealer(id: number, dealerData: DealerDto): Promise<Dealer> {
    const dealer = await this.dealerRepository.findOne({ where: { id: id }, relations: ['user', 'dealerProductMargins', 'dealerProductMargins.product', 'dealerCategoryMargins', 'dealerCategoryMargins.category'] });
    if (!dealer) {
      throw new NotFoundException(`Dealer with ID ${id} not found`);
    }

    dealer.name = dealerData.name;
    dealer.phone = dealerData.phone;
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
    await this.dealerRepository.delete(dealer.id);
  }

}

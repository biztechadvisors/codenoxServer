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
import { DealerCategoryMarginRepository, DealerProductMarginRepository, DealerRepository, UserRepository } from './users.repository';
import { DeepPartial, FindOneOptions, FindOperator, Repository } from 'typeorm';
import { Address } from 'src/addresses/entities/address.entity';
import { Profile } from './entities/profile.entity';
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


  ) { }

  //-------------------------------------------------------- 

  private users: User[] = users;

  create(createUserDto: CreateUserDto) {
    return this.users[0];
  }

  async getUsers({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = this.users;
    // let data = await this.userRepository.find()
    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // TODO: Temp Solution
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
    const url = `/users?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getUsersNotify({ limit }: GetUsersDto): User[] {
    const data: any = this.users;
    return data?.slice(0, limit);
  }

  findOne(id: number) {
    return this.users.find((user) => user.id === id);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.users[0];
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  makeAdmin(user_id: string) {
    return this.users.find((u) => u.id === Number(user_id));
  }

  banUser(id: number) {
    const user = this.users.find((u) => u.id === Number(id));

    user.is_active = !user.is_active;

    return user;
  }

  activeUser(id: number) {
    const user = this.users.find((u) => u.id === Number(id));

    user.is_active = !user.is_active;

    return user;
  }

  // -------------------------------Dealer Services----------------------

  async createDealer(dealerData: DealerDto) {
    console.log("dealerData.user.id", dealerData.user.id)
    const user = await this.userRepository.findOne({ where: { id: dealerData.user.id } });

    console.log("User***", user)
    if (!user && user.type === UserType.Dealer) {
      throw new NotFoundException(`User with ID ${dealerData.user} not found`);
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
    const dealer = await this.dealerRepository.findOne({ where: { id: id }, relations: ['user', 'dealerProductMargins', 'dealerCategoryMargins'] });
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

    // Update the dealer product margins
    for (const marginData of dealerData.dealerProductMargins) {
      let margin = dealer.dealerProductMargins.find(m => m.id === marginData.id);
      if (!margin) {
        margin = new DealerProductMargin();
        dealer.dealerProductMargins.push(margin);
      }
      const product = await this.productRepository.findOne({ where: { id: marginData.product.id } });
      margin.product = product;
      margin.margin = marginData.margin;
      margin.isActive = marginData.isActive;
    }

    // Remove any dealer product margins not present in the update data
    dealer.dealerProductMargins = dealer.dealerProductMargins.filter(m => dealerData.dealerProductMargins.some(md => md.id === m.id));

    // Update the dealer category margins
    for (const marginData of dealerData.dealerCategoryMargins) {
      let margin = dealer.dealerCategoryMargins.find(m => m.id === marginData.id);
      if (!margin) {
        margin = new DealerCategoryMargin();
        dealer.dealerCategoryMargins.push(margin);
      }
      const category = await this.categoryRepository.findOne({ where: { id: marginData.category.id } });
      margin.category = category;
      margin.margin = marginData.margin;
      margin.isActive = marginData.isActive;
    }

    // Remove any dealer category margins not present in the update data
    dealer.dealerCategoryMargins = dealer.dealerCategoryMargins.filter(m => dealerData.dealerCategoryMargins.some(md => md.id === m.id));

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


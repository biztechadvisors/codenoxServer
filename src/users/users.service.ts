import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto, UserPaginator } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import Fuse from 'fuse.js';

import { User } from './entities/user.entity';
import usersJson from '@db/users.json';
import { paginate } from 'src/common/pagination/paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';
import { Repository } from 'typeorm';
import { Address } from 'src/addresses/entities/address.entity';
import { Profile } from './entities/profile.entity';
import { AddressRepository } from 'src/addresses/addresses.repository';
import { ProfileRepository } from './profile.repository';
import { AttachmentRepository } from 'src/common/common.repository';

const users = plainToClass(User, usersJson);

const options = {
  keys: ['name', 'type.slug', 'categories.slug', 'status'],
  threshold: 0.3,
};
const fuse = new Fuse(users, options);

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    @InjectRepository(AddressRepository) private addressesRepository: AddressRepository,
    @InjectRepository(ProfileRepository) private profilesRepository: ProfileRepository,
    // @InjectRepository(AttachmentRepository) private attachmentRepository: AttachmentRepository,

  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.name = createUserDto.name;
    user.email = createUserDto.email;
    user.password = createUserDto.password;

    const addresses = createUserDto.address.map((addressDto) => {
      const address = new Address();
      address.title = addressDto.title;
      address.type = addressDto.type;
      address.default = addressDto.default;
      address.address = addressDto.address;

      return address;
    });

    // Create the profile
    const profile = new Profile();
    profile.avatar = createUserDto.profile.avatar;
    profile.bio = createUserDto.profile.bio;
    profile.socials = createUserDto.profile.socials;
    profile.contact = createUserDto.profile.contact;
    profile.customer = user;

    await this.userRepository.save(user);
    await this.addressesRepository.save(addresses);
    await this.profilesRepository.save(profile);

    return user;
  }


  // async getUsers(): Promise<User> {
  //   try {
  //     const found = await this.userRepository.find();
  //     if (!found) {
  //       throw new NotFoundException(`User not found`);
  //     }
  //     return found;
  //   } catch (err) {
  //     return err
  //   }
  // }

  findOne(id: number) {
    const found = this.userRepository
    // return this.userRepository.find(id);
  }

  //-------------------------------------------------------- 

  // private users: User[] = users;

  // create(createUserDto: CreateUserDto) {
  //   return this.users[0];
  // }

  // async getUsers({
  //   text,
  //   limit,
  //   page,
  //   search,
  // }: GetUsersDto): Promise<UserPaginator> {
  //   if (!page) page = 1;
  //   if (!limit) limit = 30;
  //   const startIndex = (page - 1) * limit;
  //   const endIndex = page * limit;
  //   let data: User[] = this.users;
  //   if (text?.replace(/%/g, '')) {
  //     data = fuse.search(text)?.map(({ item }) => item);
  //   }

  //   if (search) {
  //     const parseSearchParams = search.split(';');
  //     const searchText: any = [];
  //     for (const searchParam of parseSearchParams) {
  //       const [key, value] = searchParam.split(':');
  //       // TODO: Temp Solution
  //       if (key !== 'slug') {
  //         searchText.push({
  //           [key]: value,
  //         });
  //       }
  //     }

  //     data = fuse
  //       .search({
  //         $and: searchText,
  //       })
  //       ?.map(({ item }) => item);
  //   }

  //   const results = data.slice(startIndex, endIndex);
  //   const url = `/users?limit=${limit}`;

  //   return {
  //     data: results,
  //     ...paginate(data.length, page, limit, results.length, url),
  //   };
  // }

  // getUsersNotify({ limit }: GetUsersDto): User[] {
  //   const data: any = this.users;
  //   return data?.slice(0, limit);
  // }

  // findOne(id: number) {
  //   return this.users.find((user) => user.id === id);
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return this.users[0];
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  // makeAdmin(user_id: string) {
  //   return this.users.find((u) => u.id === Number(user_id));
  // }

  // banUser(id: number) {
  //   const user = this.users.find((u) => u.id === Number(id));

  //   user.is_active = !user.is_active;

  //   return user;
  // }

  // activeUser(id: number) {
  //   const user = this.users.find((u) => u.id === Number(id));

  //   user.is_active = !user.is_active;

  //   return user;
  // }
}
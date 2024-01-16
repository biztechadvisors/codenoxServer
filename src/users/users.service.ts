/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserDto, Permission } from './dto/create-user.dto';
import { GetUsersDto, UserPaginator } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import usersJson from '@db/users.json';
import { paginate } from 'src/common/pagination/paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialRepository, UserRepository } from './users.repository';
import { DeepPartial, FindOneOptions, FindOperator, Repository } from 'typeorm';
import { Address, AddressType, UserAddress } from 'src/addresses/entities/address.entity';
import { Profile, Social } from './entities/profile.entity';
import { AddressRepository, UserAddressRepository } from 'src/addresses/addresses.repository';
import { ProfileRepository } from './profile.repository';
import { AttachmentRepository } from 'src/common/common.repository';
import { Attachment } from 'src/common/entities/attachment.entity';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { CreateProfileDto, CreateSocialDto } from './dto/create-profile.dto';

const users = plainToClass(User, usersJson);

const options = {
  keys: ['name', 'type.slug', 'categories.slug', 'status'],
  threshold: 0.3,
};

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    @InjectRepository(AddressRepository) private addressesRepository: AddressRepository,
    // @InjectRepository(UserAddressRepository) private userAddressesRepository: UserAddressRepository,
    @InjectRepository(ProfileRepository) private profilesRepository: ProfileRepository,
    @InjectRepository(SocialRepository) private socialRepository: SocialRepository,
    // @InjectRepository(AttachmentRepository) private attachmentRepository: AttachmentRepository,

  ) { }

  //-------------------------------------------------------- 

  private users: User[] = users;

//   async create(createUserDto: CreateUserDto):Promise<User> {
//     console.log(createUserDto)
//     console.log(createUserDto.name)

//     const newUser = new User();
//     newUser.name = createUserDto.name
//     newUser.email = createUserDto.email
//     newUser.isVerified = createUserDto.isVerified
//     newUser.is_active = createUserDto.is_active
//     newUser.shop_id = createUserDto.shop_id
//     // const Users =this.userRepository.save(newUser)
//     if(newUser.profile){
//       const Profiles = newUser.profile
//       const profile = new Profile()
//       profile.bio = Profiles.bio
//       profile.contact = Profiles.contact
      
//       // Remaining  ===  avatar, socials,customerId
//     }
// if(Array.isArray(newUser.address)&& newUser.address){
//     for(const address of newUser.address){
//       const newAddress = new Address()
//       newAddress.title = address.title
//       newAddress.default = address.default

//       const Addresses = address.type ? address.type : AddressType.BILLING;
//       newAddress.type = Addresses === AddressType.BILLING ? AddressType.SHIPPING : AddressType.BILLING;
//       // if(newAddress.address){
//       //   const UAddress = newAddress.address
//       //   const existingUser = await this.userAddressesRepository.findOne({
//       //     where: { street_address: UAddress.street_address, city:UAddress.city },
//       //   });
//       //   console.log(existingUser.id)
//       // }
//       newAddress.customer= Users
//       if(newAddress.customer){
//         const Customer = newAddress.customer
//         const existingCustomer = await this.userRepository.findOne({
//           where: { name: Customer.name, email:Customer.email },
//         });
//         console.log(existingCustomer.id)
//       }

//       const saveAddress = await this.addressesRepository.save(newAddress)
//       console.log(saveAddress.id)
//     }}
//     const Permissions = newUser.permission? newUser.permission:Permission.CUSTOMER
//     switch(Permissions){
//       case Permission.SUPER_ADMIN:
//         newUser.permission = Permission.SUPER_ADMIN
//         break;
//       case Permission.CUSTOMER:
//         newUser.permission = Permission.CUSTOMER
//         break;
//       case Permission.STAFF:
//         newUser.permission = Permission.STAFF
//         break;
//       case Permission.STORE_OWNER:
//         newUser.permission = Permission.STORE_OWNER
//         break;
//       default:
//     }

    
       
    
//     // return this.userRepository.save(newUser)
//     return ;
//   }
async create(createUserDto: CreateUserDto) {
  console.log(createUserDto);
  console.log(createUserDto.name);

  const newUser = new User();
  newUser.name = createUserDto.name;
  newUser.email = createUserDto.email;
  newUser.isVerified = createUserDto.isVerified;
  newUser.is_active = createUserDto.is_active;
  newUser.shop_id = createUserDto.shop_id;
  
  const userPermission = createUserDto.permission ? createUserDto.permission : Permission.CUSTOMER;
  switch (userPermission) {
    case Permission.SUPER_ADMIN:
      newUser.permission = Permission.SUPER_ADMIN;
      break;
    case Permission.CUSTOMER:
      newUser.permission = Permission.CUSTOMER;
      break;
    case Permission.STAFF:
      newUser.permission = Permission.STAFF;
      break;
    case Permission.STORE_OWNER:
      newUser.permission = Permission.STORE_OWNER;
      break;
    default:
  }
  const savedUser = await this.userRepository.save(newUser);
  return savedUser;
}

async createProfile(createProfileDto:CreateProfileDto){
  const newProfile = new Profile()
  newProfile.avatar = createProfileDto.avatar
  newProfile.bio = createProfileDto.bio
  newProfile.contact = createProfileDto.contact
  newProfile.customer = createProfileDto.customer
  
  await this.profilesRepository.save(newProfile)
}

async createSocial(createSocialDto:CreateSocialDto){
  const newSocial = new Social()
  newSocial.link = createSocialDto.link
  newSocial.type = createSocialDto.type
  newSocial.profile = createSocialDto.profile

  await this.socialRepository.save(newSocial)
}

async getUsers(){
  const AllUsers = await this.userRepository.find({
    relations:['profile',]
  })
  return AllUsers;
}

async findAll(){
  const AllProfile = await this.profilesRepository.find({
    relations:['customer']
  })
  return AllProfile;
}

async findAllSocial(){
  const AllSocial = await this.socialRepository.find({
    relations:['profile', 'profile.customer','profile.avatar']
  })
  return AllSocial;
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
}
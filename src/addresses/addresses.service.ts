/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable,NotFoundException  } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address, AddressType, UserAddress } from './entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressRepository, UserAddressRepository } from './addresses.repository';
import { Repository, FindManyOptions   } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserRepository } from 'src/users/users.repository';


@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: UserAddressRepository,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    console.log('Post Work');
    const newAddress = new Address();
    newAddress.title = createAddressDto.title
    newAddress.default = createAddressDto.default
    if (createAddressDto.address) {
      const existingAddress = await this.userAddressRepository.findOne({
        where: { street_address: createAddressDto.address.street_address, zip:createAddressDto.address.zip },
      });
      if (existingAddress) {
        newAddress.address = existingAddress
        // console.log(existingAddress.id);
      } else {
        console.error('User not found');
      }
    }
    newAddress.type = createAddressDto.type
    if (createAddressDto.customer) {
      const existingUser = await this.userRepository.findOne({
        where: { name: createAddressDto.customer.name, email:createAddressDto.customer.email },
      });
      if (existingUser) {
        newAddress.customer = existingUser
        console.log(existingUser.id);
      } else {
        console.error('User not found');
      }
    } else {
      console.error('Customer is undefined in createAddressDto');
    }

    // Save the newAddress to the database
    const savedAddress = await this.addressRepository.save(newAddress);

    console.log(savedAddress);

    return savedAddress; 
  }
  
  async findAll(): Promise<Address[]> {
    console.log('get work')
    const allAddress =  await this.addressRepository.find({
      relations:['address']
    });
    return allAddress;
  }

  async findOne(id: number) {
    const findAddress =  await this.addressRepository.findOne({
      where:{id}
      // relations:['address']
    });
    return findAddress;
  }

  async update(id: number, updateAddressDto: UpdateAddressDto):Promise<Address[]> {
    try {
      // Find the existing address by id
      const existingAddress = await this.addressRepository.findOne({
        where: { id },
        relations: ['address', 'customer'],
      });

      if (!existingAddress) {
        throw new NotFoundException('Address not found');
      }

      // Update properties based on the updateAddressDto
      existingAddress.title = updateAddressDto.title ?? existingAddress.title;
      existingAddress.default = updateAddressDto.default ?? existingAddress.default;
      existingAddress.type = updateAddressDto.type ?? existingAddress.type;

      if (updateAddressDto.address) {
        const userAddress = await this.userAddressRepository.findOne({
              where: { street_address: updateAddressDto.address.street_address, zip: updateAddressDto.address.zip },
            });
        existingAddress.address = userAddress;
      }

      if (updateAddressDto.customer) {
        const user = await this.userRepository.findOne({
          where:{name:updateAddressDto.customer.name, email:updateAddressDto.customer.email}
        })
        existingAddress.customer = user;
      }
      const updatedAddress = await this.addressRepository.save(existingAddress);
      console.log(updatedAddress);

      return 
    } catch (error) {
      console.error('Error updating address', error);
      throw error;
    }
  }

  async remove(id: number) {
    const existingAddress = await this.addressRepository.findOne({where :{id}});

    if (!existingAddress) {
      throw new NotFoundException('Address not found');
    }
    await this.addressRepository.remove(existingAddress);
  }
}

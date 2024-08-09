import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address, UserAddress } from './entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRepository } from 'src/users/users.repository';
import { AddressRepository, UserAddressRepository } from './addresses.repository';
import { ShopRepository } from 'src/shops/shops.repository';
import { Shop } from 'src/shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(UserAddress) private readonly userAddressRepository: UserAddressRepository,
    @InjectRepository(Address) private readonly addressRepository: AddressRepository,
    @InjectRepository(User) private readonly userRepository: UserRepository,
    @InjectRepository(Shop) private readonly shopRepository: ShopRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  async create(createAddressDto: CreateAddressDto): Promise<Address> {

    // Create a new UserAddress with the provided data
    const userAddress = new UserAddress();
    userAddress.street_address = createAddressDto.address.street_address;
    userAddress.country = createAddressDto.address.country;
    userAddress.city = createAddressDto.address.city;
    userAddress.state = createAddressDto.address.state;
    userAddress.zip = createAddressDto.address.zip;

    // Save the new UserAddress and retrieve the saved entity
    const savedUserAddress = await this.userAddressRepository.save(userAddress);

    // Create a new Address with the provided data
    const address = new Address();
    address.title = createAddressDto.title;
    address.type = createAddressDto.type;
    address.default = createAddressDto.default;
    address.address = savedUserAddress;  // Use the saved UserAddress

    const user = await this.userRepository.findOne({ where: { id: createAddressDto.customer_id }, relations: ['permission'] });  // Find the user
    if (!user) {
      throw new Error('User does not exist');
    }
    address.customer = user;

    // Save the new Address and retrieve the saved entity
    const savedAddress = await this.addressRepository.save(address);

    return savedAddress;
  }


  async findAll(userId: number): Promise<Address[]> {
    const cacheKey = `addresses:userId:${userId}`;
    let addresses = await this.cacheManager.get<Address[]>(cacheKey);

    if (addresses) {
      return addresses; // Return the cached data
    }

    // Fetch data from the database if not cached
    addresses = await this.addressRepository.find({
      where: { customer: { id: userId } },
      relations: ['address'],
    });

    // Store the data in the cache with an expiration time (e.g., 30 minutes)
    await this.cacheManager.set(cacheKey, addresses, 1800);

    return addresses;
  }

  async findOne(id: number): Promise<Address | undefined> {
    const cacheKey = `address:id:${id}`;
    let address = await this.cacheManager.get<Address>(cacheKey);

    if (address) {
      return address; // Return the cached address
    }

    // Fetch the address from the database if not cached
    address = await this.addressRepository.findOne({ where: { id: id }, relations: ['address'] });

    // Store the address in the cache with an expiration time (e.g., 30 minutes)
    if (address) {
      await this.cacheManager.set(cacheKey, address, 1800);
    }

    return address;
  }

  async update(id: number, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id }, relations: ['address'] });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    address.title = updateAddressDto.title;
    address.type = updateAddressDto.type;
    address.default = updateAddressDto.default;

    let userAddress = address.address;

    if (userAddress) {
      userAddress.street_address = updateAddressDto.address.street_address;
      userAddress.country = updateAddressDto.address.country;
      userAddress.city = updateAddressDto.address.city;
      userAddress.state = updateAddressDto.address.state;
      userAddress.zip = updateAddressDto.address.zip;
    } else {
      this.userAddressRepository.save(updateAddressDto.address);
      address.address = userAddress;
    }
    await this.addressRepository.save(address);

    return address;
  }


  async remove(id: number) {
    // Find the address with the specified id
    const address = await this.addressRepository.findOne({
      where: { id: id },
      relations: ["address"]
    });

    if (address) {
      // Find the UserAddress with the specified id
      const userAddress = address.address;
      address.address = null
      address.customer = null

      await this.addressRepository.save(address);
      // Remove the UserAddress
      await this.userAddressRepository.remove(userAddress);
      // Remove the address
      await this.addressRepository.remove(address);
    }

    return [];
  }


}
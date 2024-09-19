import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Add, UserAdd } from './entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(UserAdd)
    private readonly userAddressRepository: Repository<UserAdd>,
    @InjectRepository(Add)
    private readonly addressRepository: Repository<Add>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  // Create new address
  async create(createAddressDto: CreateAddressDto): Promise<Add> {
    const user = await this.userRepository.findOne({ where: { id: createAddressDto.customer_id } });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    // Create UserAdd (Address details)
    const userAddress = this.userAddressRepository.create(createAddressDto.address);
    const savedUserAddress = await this.userAddressRepository.save(userAddress);

    // Create Add (Address entity linked to User and UserAdd)
    const address = this.addressRepository.create({
      title: createAddressDto.title,
      type: createAddressDto.type,
      default: createAddressDto.default,
      address: savedUserAddress,
      customer: user,
    });

    const savedAddress = await this.addressRepository.save(address);

    // Invalidate cache for user addresses
    await this.cacheManager.del(`addresses:userId:${user.id}`);

    return savedAddress;
  }

  // Fetch all addresses for a user with caching
  async findAll(userId: number): Promise<Add[]> {
    const cacheKey = `addresses:userId:${userId}`;
    let addresses = await this.cacheManager.get<Add[]>(cacheKey);

    if (!addresses) {
      addresses = await this.addressRepository.find({
        where: { customer: { id: userId } },
        relations: ['address'],
      });

      if (addresses.length) {
        await this.cacheManager.set(cacheKey, addresses, 60);
      }
    }

    return addresses;
  }

  // Fetch a specific address by ID with caching
  async findOne(id: number): Promise<Add> {
    const cacheKey = `address:id:${id}`;
    let address = await this.cacheManager.get<Add>(cacheKey);

    if (!address) {
      address = await this.addressRepository.findOne({
        where: { id },
        relations: ['address', 'customer'],
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      await this.cacheManager.set(cacheKey, address, 60);
    }

    return address;
  }

  // Update an address by ID
  async update(id: number, updateAddressDto: UpdateAddressDto): Promise<Add> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['address'],
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    // Update UserAdd (Address details) if provided
    const userAddress = address.address;
    if (userAddress && updateAddressDto.address) {
      Object.assign(userAddress, updateAddressDto.address);
      await this.userAddressRepository.save(userAddress);
    }

    // Update Add (Address entity)
    Object.assign(address, updateAddressDto);
    await this.addressRepository.save(address);

    // Invalidate cache for user addresses and this specific address
    await this.cacheManager.del(`addresses:userId:${address.customer.id}`);
    await this.cacheManager.del(`address:id:${id}`);

    return address;
  }

  // Remove an address by ID
  async remove(id: number): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['address', 'customer'],
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    await this.addressRepository.remove(address);

    // Invalidate cache for user addresses and this specific address
    await this.cacheManager.del(`addresses:userId:${address.customer.id}`);
    await this.cacheManager.del(`address:id:${id}`);
  }
}
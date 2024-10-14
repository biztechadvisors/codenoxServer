import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Add, UserAdd } from './entities/address.entity';
import { User } from 'src/users/entities/user.entity';
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

  // Create a new address
  async create(createAddressDto: CreateAddressDto): Promise<Add> {
    const user = await this.getUserById(createAddressDto.customer_id);

    const userAddress = this.userAddressRepository.create({
      ...createAddressDto.address,
      customer_id: user.id,
    });

    const savedUserAddress = await this.userAddressRepository.save(userAddress);

    const address = this.addressRepository.create({
      ...createAddressDto,
      address: savedUserAddress,
      customer: user,
    });

    const savedAddress = await this.addressRepository.save(address);

    // Invalidate user addresses cache after creation
    await this.invalidateUserCache(user.id);

    return savedAddress;
  }

  // Fetch all addresses for a specific user with caching
  async findAll(userId: number): Promise<Add[]> {
    const cacheKey = `addresses:userId:${userId}`;
    let addresses = await this.cacheManager.get<Add[]>(cacheKey);

    if (!addresses) {
      addresses = await this.addressRepository.find({
        where: { customer: { id: userId } },
        relations: ['address'],
      });

      if (addresses.length > 0) {
        await this.cacheManager.set(cacheKey, addresses, 3600);
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

      await this.cacheManager.set(cacheKey, address, 3600);
    }

    return address;
  }

  // Update an address by ID
  async update(id: number, updateAddressDto: UpdateAddressDto): Promise<Add> {
    const address = await this.getAddressById(id);

    // Update UserAdd details if necessary
    if (updateAddressDto.address && address.address) {
      Object.assign(address.address, updateAddressDto.address);
      await this.userAddressRepository.save(address.address);
    }

    // Update the main address details
    Object.assign(address, updateAddressDto);
    const updatedAddress = await this.addressRepository.save(address);

    // Invalidate caches for the updated address and user
    await this.invalidateUserCache(address.customer.id);
    await this.invalidateAddressCache(id);

    return updatedAddress;
  }

  // Remove an address by ID
  async remove(id: number): Promise<void> {
    const address = await this.getAddressById(id);

    await this.addressRepository.remove(address);

    // Invalidate caches for the deleted address and user
    await this.invalidateUserCache(address.customer.id);
    await this.invalidateAddressCache(id);
  }

  // Helper method to fetch a user by ID
  private async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Helper method to fetch an address by ID
  private async getAddressById(id: number): Promise<Add> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['address', 'customer'],
    });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  // Invalidate cache for user addresses
  private async invalidateUserCache(userId: number): Promise<void> {
    await this.cacheManager.del(`addresses:userId:${userId}`);
  }

  // Invalidate cache for a specific address
  private async invalidateAddressCache(addressId: number): Promise<void> {
    await this.cacheManager.del(`address:id:${addressId}`);
  }
}

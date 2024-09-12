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
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  async create(createAddressDto: CreateAddressDto): Promise<Add> {
    const user = await this.userRepository.findOne({
      where: { id: createAddressDto.customer_id },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    // Create UserAddress
    const userAddress = this.userAddressRepository.create(createAddressDto.address);
    const savedUserAddress = await this.userAddressRepository.save(userAddress);

    // Create Address
    const address = this.addressRepository.create({
      title: createAddressDto.title,
      type: createAddressDto.type,
      default: createAddressDto.default,
      address: savedUserAddress,
      customer: user,
    });

    const savedAddress = await this.addressRepository.save(address);

    // Invalidate cache after creating new address
    const cacheKey = `addresses:userId:${user.id}`;
    await this.cacheManager.del(cacheKey);

    return savedAddress;
  }

  async findAll(userId: number): Promise<Add[]> {
    const cacheKey = `addresses:userId:${userId}`;
    let addresses = await this.cacheManager.get<Add[]>(cacheKey);

    if (!addresses) {
      addresses = await this.addressRepository.find({
        where: { customer: { id: userId } },
        relations: ['address'],
      });

      await this.cacheManager.set(cacheKey, addresses, 1800);
    }

    return addresses;
  }

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

      await this.cacheManager.set(cacheKey, address, 1800);
    }

    return address;
  }

  async update(id: number, updateAddressDto: UpdateAddressDto): Promise<Add> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['address'],
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    const userAddress = address.address;
    if (userAddress) {
      Object.assign(userAddress, updateAddressDto.address);
      await this.userAddressRepository.save(userAddress);
    }

    Object.assign(address, updateAddressDto);
    await this.addressRepository.save(address);

    // Invalidate cache after update
    const cacheKey = `addresses:userId:${address.customer.id}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(`address:id:${id}`);

    return address;
  }

  async remove(id: number) {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: ['address', 'customer'],
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    await this.addressRepository.remove(address);

    // Invalidate cache after removal
    const cacheKey = `addresses:userId:${address.customer.id}`;
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(`address:id:${id}`);
  }
}

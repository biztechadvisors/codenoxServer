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

  async create(createAddressDto: CreateAddressDto): Promise<Add> {
    // Fetch the user from the database using the provided customer ID
    const user = await this.userRepository.findOne({ where: { id: createAddressDto.customer_id } });

    // If the user doesn't exist, throw a NotFoundException
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    // Create UserAdd (Address details) using the properties from createAddressDto.address
    const userAddress = this.userAddressRepository.create({
      street_address: createAddressDto.address.street_address,
      country: createAddressDto.address.country,
      city: createAddressDto.address.city,
      state: createAddressDto.address.state,
      zip: createAddressDto.address.zip,
      customer_id: user.id, // Set customer_id to the user's ID
    });

    // Save the UserAdd entity to the database
    const savedUserAddress = await this.userAddressRepository.save(userAddress);

    // Create the Add entity and link it to User and UserAdd
    const addressOb = new Add();
    addressOb.title = createAddressDto.title;
    addressOb.type = createAddressDto.type;
    addressOb.default = createAddressDto.default;
    addressOb.address = savedUserAddress; // Link the saved address

    // Assign the user to the customer relation
    addressOb.customer = user;

    // Save the Add entity to the database
    const savedAddress = await this.addressRepository.save(addressOb);

    // Debug: Ensure the customer_id is saved
    console.log('Saved Add:', savedAddress);

    // Manually update and ensure relation
    if (!savedAddress.customer) {
      savedAddress.customer = user;
      await this.addressRepository.save(savedAddress);
    }

    // Invalidate the cache for user addresses to ensure the data is fresh
    await this.cacheManager.del(`addresses:userId:${user.id}`);

    // Return the saved address entity
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
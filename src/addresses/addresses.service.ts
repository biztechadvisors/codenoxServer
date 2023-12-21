import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address, UserAddress } from './entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRepository } from 'src/users/users.repository';
import { AddressRepository, UserAddressRepository } from './addresses.repository';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(UserAddress) private readonly userAddressRepository: UserAddressRepository,
    @InjectRepository(Address) private readonly addressRepository: AddressRepository,
    @InjectRepository(User) private readonly userRepository: UserRepository,
  ) { }


  async create(createAddressDto: CreateAddressDto) {
    // Create a new UserAddress with the provided data
    const userAddress = new UserAddress();
    userAddress.street_address = createAddressDto.address.street_address;
    userAddress.country = createAddressDto.address.country;
    userAddress.city = createAddressDto.address.city;
    userAddress.state = createAddressDto.address.state;
    userAddress.zip = createAddressDto.address.zip;
    await this.userAddressRepository.save(userAddress);  // Save the new UserAddress

    // Create a new Address with the provided data
    const address = new Address();
    address.title = createAddressDto.title;
    address.type = createAddressDto.type;
    address.default = createAddressDto.default;
    address.address = userAddress;
    const user = await this.userRepository.findOne({ where: { id: createAddressDto.customer_id } });  // Find the user
    address.customer = user;
    await this.addressRepository.save(address);

    return address;
  }

  async findAll() {
    // This action returns all addresses
    const addresses = await this.addressRepository.find({ relations: ["address"] });
    return addresses;
  }

  async findOne(id: number) {
    // This action returns a #${id} address
    const address = await this.addressRepository.findOne({ where: { id: id }, relations: ["address"] });
    return address;
  }

  async update(id: number, updateAddressDto: UpdateAddressDto) {
    // Find the address with the specified id
    const address = await this.addressRepository.findOne({ where: { id: id }, relations: ["address"] });
    if (address) {
      // Update the properties of the address
      address.title = updateAddressDto.title;
      address.type = updateAddressDto.type;
      address.default = updateAddressDto.default;

      // Check if address.address is not null
      if (address.address) {
        // Update the properties of the UserAddress
        address.address.street_address = updateAddressDto.address.street_address;
        address.address.country = updateAddressDto.address.country;
        address.address.city = updateAddressDto.address.city;
        address.address.state = updateAddressDto.address.state;
        address.address.zip = updateAddressDto.address.zip;

        // Save the updated UserAddress
        await this.userAddressRepository.save(address.address);
      } else {
        // Create a new UserAddress with the provided data
        const userAddress = new UserAddress();
        userAddress.street_address = updateAddressDto.address.street_address;
        userAddress.country = updateAddressDto.address.country;
        userAddress.city = updateAddressDto.address.city;
        userAddress.state = updateAddressDto.address.state;
        userAddress.zip = updateAddressDto.address.zip;

        // Save the new UserAddress
        await this.userAddressRepository.save(userAddress);

        // Associate the UserAddress with the Address
        address.address = userAddress;
      }

      // Save the updated address
      await this.addressRepository.save(address);
    }
    return address;
  }

  async remove(id: number) {

    // Find the address with the specified id
    const address = await this.addressRepository.findOne({ where: { id: id } });

    // Find the UserAddress with the specified addressId
    const userAddress = await this.userAddressRepository.findOne({ where: { id: address.address.id } });

    if (userAddress) {
      // Remove the UserAddress
      await this.userAddressRepository.remove(userAddress);

      if (address) {
        // Remove the address
        await this.addressRepository.remove(address);
      }
    }

    return [];
  }

}

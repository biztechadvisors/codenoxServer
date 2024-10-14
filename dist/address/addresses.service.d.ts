import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Add, UserAdd } from './entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
export declare class AddressesService {
    private readonly userAddressRepository;
    private readonly addressRepository;
    private readonly userRepository;
    private readonly cacheManager;
    constructor(userAddressRepository: Repository<UserAdd>, addressRepository: Repository<Add>, userRepository: Repository<User>, cacheManager: Cache);
    create(createAddressDto: CreateAddressDto): Promise<Add>;
    findAll(userId: number): Promise<Add[]>;
    findOne(id: number): Promise<Add>;
    update(id: number, updateAddressDto: UpdateAddressDto): Promise<Add>;
    remove(id: number): Promise<void>;
    private getUserById;
    private getAddressById;
    private invalidateUserCache;
    private invalidateAddressCache;
}

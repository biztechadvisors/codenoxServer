import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CacheService } from '../helpers/cacheService';
export declare class AddressesController {
    private readonly addressesService;
    private readonly cacheService;
    constructor(addressesService: AddressesService, cacheService: CacheService);
    createAddress(createAddressDto: CreateAddressDto): Promise<import("./entities/address.entity").Add>;
    addresses(userId: number): Promise<import("./entities/address.entity").Add[]>;
    address(id: number): Promise<import("./entities/address.entity").Add>;
    updateAddress(id: number, updateAddressDto: UpdateAddressDto): Promise<import("./entities/address.entity").Add>;
    deleteAddress(id: number): Promise<void>;
    private invalidateAddressCache;
}

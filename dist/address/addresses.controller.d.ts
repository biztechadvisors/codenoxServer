import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
export declare class AddressesController {
    private readonly addressesService;
    constructor(addressesService: AddressesService);
    createAddress(createAddressDto: CreateAddressDto): Promise<import("./entities/address.entity").Add>;
    addresses(userId: number): Promise<import("./entities/address.entity").Add[]>;
    address(id: string): Promise<import("./entities/address.entity").Add>;
    updateAddress(id: string, updateAddressDto: UpdateAddressDto): Promise<import("./entities/address.entity").Add>;
    deleteAddress(id: string): Promise<void>;
}

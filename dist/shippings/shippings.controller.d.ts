import { ShippingsService } from './shippings.service';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { GetShippingsDto } from './dto/get-shippings.dto';
export declare class ShippingsController {
    private readonly shippingsService;
    constructor(shippingsService: ShippingsService);
    create(createShippingDto: CreateShippingDto): Promise<import("./entities/shipping.entity").Shipping>;
    findAll(query: GetShippingsDto): Promise<import("./entities/shipping.entity").Shipping[]>;
    findOne(id: string): Promise<import("./entities/shipping.entity").Shipping>;
    update(id: string, updateShippingDto: UpdateShippingDto): Promise<import("./entities/shipping.entity").Shipping>;
    remove(id: string): Promise<void>;
}

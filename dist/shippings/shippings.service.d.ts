import { CreateShippingDto } from './dto/create-shipping.dto';
import { GetShippingsDto } from './dto/get-shippings.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { Shipping } from './entities/shipping.entity';
import { Repository } from 'typeorm';
export declare class ShippingsService {
    private readonly shippingRepository;
    constructor(shippingRepository: Repository<Shipping>);
    create(createShippingDto: CreateShippingDto): Promise<Shipping>;
    getShippings({ search }: GetShippingsDto): Promise<Shipping[]>;
    findOne(id: number): Promise<Shipping>;
    update(id: number, updateShippingDto: UpdateShippingDto): Promise<Shipping>;
    remove(id: number): Promise<void>;
}

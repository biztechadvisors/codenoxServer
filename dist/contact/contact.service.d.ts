import { Repository } from 'typeorm';
import { CreateContactDto, UpdateContactDto } from './dto/createcontact.dto';
import { Contact } from './entity/createcontact.entitiy';
import { Shop } from '../shops/entities/shop.entity';
import { Cache } from 'cache-manager';
export declare class ContactService {
    private readonly contactRepository;
    private readonly shopRepository;
    private readonly cacheManager;
    constructor(contactRepository: Repository<Contact>, shopRepository: Repository<Shop>, cacheManager: Cache);
    create(createContactDto: CreateContactDto): Promise<Contact>;
    findAllByShop(shopSlug: string, page?: number, limit?: number): Promise<{
        data: Contact[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: number): Promise<Contact>;
    update(id: number, updateContactDto: UpdateContactDto): Promise<Contact>;
    remove(id: number): Promise<void>;
}

import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './dto/createcontact.dto';
import { Contact } from './entity/createcontact.entitiy';
import { CacheService } from '../helpers/cacheService';
export declare class ContactController {
    private readonly contactService;
    private readonly cacheService;
    constructor(contactService: ContactService, cacheService: CacheService);
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

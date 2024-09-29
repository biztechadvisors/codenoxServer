import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto, UpdateContactDto } from './dto/createcontact.dto';
import { Contact } from './entity/createcontact.entitiy';
import { Shop } from '../shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

    ) { }

    async create(createContactDto: CreateContactDto): Promise<Contact> {
        const { shopSlug, ...contactData } = createContactDto;

        // Check if the shop exists
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopSlug} not found`);
        }

        const contact = this.contactRepository.create({ ...contactData, shop });
        return this.contactRepository.save(contact);
    }

    async findAllByShop(
        shopSlug: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ data: Contact[], total: number, page: number, limit: number }> {
        // Calculate the offset (skip) and limit (take)
        const skip = (page - 1) * limit;

        // Find the shop by its slug
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
        }

        // Use cache key based on shop slug, page, and limit
        const cacheKey = `contacts_${shopSlug}_page_${page}_limit_${limit}`;
        const cachedData = await this.cacheManager.get<{ data: Contact[], total: number }>(cacheKey);

        if (cachedData) {
            return {
                ...cachedData,
                page,
                limit
            };
        }

        // Fetch total count of contacts for pagination
        const [data, total] = await this.contactRepository.findAndCount({
            where: { shop: { id: shop.id } },
            relations: ['shop'],
            skip,
            take: limit,
        });

        const result = { data, total, page, limit };

        // Cache the result for future requests
        await this.cacheManager.set(cacheKey, result, 60); // Cache for 5 minutes (300 seconds)

        return result;
    }

    async findOne(id: number): Promise<Contact> {
        const contact = await this.contactRepository.findOne({ where: { id }, relations: ['shop'] });
        if (!contact) {
            throw new NotFoundException(`Contact with ID ${id} not found`);
        }
        return contact;
    }

    async update(id: number, updateContactDto: UpdateContactDto): Promise<Contact> {
        const contact = await this.findOne(id);
        const { shopSlug, ...updateData } = updateContactDto;

        if (shopSlug) {
            const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
            if (!shop) {
                throw new NotFoundException(`Shop with ID ${shopSlug} not found`);
            }
            contact.shop = shop;
        }

        Object.assign(contact, updateData);
        return this.contactRepository.save(contact);
    }

    async remove(id: number): Promise<void> {
        const contact = await this.findOne(id);
        await this.contactRepository.remove(contact);
    }
}
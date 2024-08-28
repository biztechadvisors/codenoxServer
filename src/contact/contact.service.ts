import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto, UpdateContactDto } from './dto/createcontact.dto';
import { Contact } from './entity/createcontact.entitiy';
import { Shop } from '../shops/entities/shop.entity';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
    ) { }

    async create(createContactDto: CreateContactDto): Promise<Contact> {
        const { shopId, ...contactData } = createContactDto;

        // Check if the shop exists
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopId} not found`);
        }

        const contact = this.contactRepository.create({ ...contactData, shop });
        return this.contactRepository.save(contact);
    }

    async findAllByShop(shopSlug: string): Promise<Contact[]> {
        // Find the shop by its slug
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
        }

        // Fetch all contacts related to the shop
        return this.contactRepository.find({ where: { shop: { id: shop.id } }, relations: ['shop'] });
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
        const { shopId, ...updateData } = updateContactDto;

        if (shopId) {
            const shop = await this.shopRepository.findOne({ where: { id: shopId } });
            if (!shop) {
                throw new NotFoundException(`Shop with ID ${shopId} not found`);
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
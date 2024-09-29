import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './dto/createcontact.dto';
import { Contact } from './entity/createcontact.entitiy';
import { CacheService } from '../helpers/cacheService';

@Controller('contacts')
export class ContactController {
    constructor(private readonly contactService: ContactService, private readonly cacheService: CacheService) { }

    @Post()
    async create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
        await this.cacheService.invalidateCacheBySubstring("contacts")
        return this.contactService.create(createContactDto);
    }

    @Get('shop/:shopSlug')
    async findAllByShop(
        @Param('shopSlug') shopSlug: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<{ data: Contact[], total: number, page: number, limit: number }> {
        return this.contactService.findAllByShop(shopSlug, page, limit);
    }


    @Get(':id')
    findOne(@Param('id') id: number): Promise<Contact> {
        return this.contactService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateContactDto: UpdateContactDto): Promise<Contact> {
        await this.cacheService.invalidateCacheBySubstring("contacts")
        return this.contactService.update(id, updateContactDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        await this.cacheService.invalidateCacheBySubstring("contacts")
        return this.contactService.remove(id);
    }
}
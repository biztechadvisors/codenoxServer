import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './dto/createcontact.dto';
import { Contact } from './entity/createcontact.entitiy';

@Controller('contacts')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Post()
    create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
        return this.contactService.create(createContactDto);
    }

    @Get('shop/:shopSlug')
    findAllByShop(@Param('shopSlug') shopSlug: string): Promise<Contact[]> {
        return this.contactService.findAllByShop(shopSlug);
    }

    @Get(':id')
    findOne(@Param('id') id: number): Promise<Contact> {
        return this.contactService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() updateContactDto: UpdateContactDto): Promise<Contact> {
        return this.contactService.update(id, updateContactDto);
    }

    @Delete(':id')
    remove(@Param('id') id: number): Promise<void> {
        return this.contactService.remove(id);
    }
}
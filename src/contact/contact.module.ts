import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entity/createcontact.entitiy';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { Shop } from '../shops/entities/shop.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Contact, Shop])],
    providers: [ContactService],
    controllers: [ContactController],
    exports: [ContactService],
})
export class ContactModule { }

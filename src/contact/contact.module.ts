import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entity/createcontact.entitiy';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { Shop } from '../shops/entities/shop.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from '../helpers/cacheService';

@Module({
    imports: [TypeOrmModule.forFeature([Contact, Shop]),
    CacheModule.register()
    ],
    providers: [ContactService, CacheService],
    controllers: [ContactController],
    exports: [ContactService],
})
export class ContactModule { }

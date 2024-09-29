// src/get-inspired/get-inspired.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetInspired } from './entities/get-inspired.entity';
import { GetInspiredService } from './get-inspired.service';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { GetInspiredController } from './get-inspired.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { Tag } from '../tags/entities/tag.entity';
import { CacheService } from '../helpers/cacheService';

@Module({
    imports: [TypeOrmModule.forFeature([GetInspired, Attachment, Shop, Tag]),
    CacheModule.register()],
    controllers: [GetInspiredController],
    providers: [GetInspiredService, CacheService],
})
export class GetInspiredModule { }

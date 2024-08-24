import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { Region } from '../region/entities/region.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Blog, Attachment, Shop, Region]),
    CacheModule.register()
    ],
    providers: [BlogService],
    controllers: [BlogController],
})
export class BlogModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Blog, Attachment, Shop])],
    providers: [BlogService],
    controllers: [BlogController],
})
export class BlogModule { }

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Shop } from 'src/shops/entities/shop.entity';

@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(Blog)
        private readonly blogRepository: Repository<Blog>,
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
    ) { }

    async createBlog(createBlogDto: CreateBlogDto): Promise<Blog> {
        const { title, content, shopId, attachmentIds } = createBlogDto;

        const attachments = attachmentIds ? await this.attachmentRepository.findByIds(attachmentIds) : [];
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });

        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopId} not found`);
        }

        const blog = this.blogRepository.create({
            title,
            content,
            shop,
            attachments,
        });

        return this.blogRepository.save(blog);
    }

    async getBlogById(id: number): Promise<Blog> {
        const blog = await this.blogRepository.findOne({
            where: { id },
            relations: ['shop', 'attachments'],
        });

        if (!blog) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }

        return blog;
    }

    async getAllBlogs(shopSlug: string): Promise<Blog[]> {
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug }, relations: ['blogs'] });
        if (!shop) {
            throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
        }

        return this.blogRepository.find({
            where: { shop: { id: shop.id } },
            relations: ['shop', 'attachments'],
        });
    }

    async updateBlog(id: number, updateBlogDto: UpdateBlogDto): Promise<Blog> {
        const blog = await this.getBlogById(id);

        if (updateBlogDto.title) blog.title = updateBlogDto.title;
        if (updateBlogDto.content) blog.content = updateBlogDto.content;

        if (updateBlogDto.shopId) {
            const shop = await this.shopRepository.findOne({ where: { id: updateBlogDto.shopId } });
            if (!shop) {
                throw new NotFoundException(`Shop with ID ${updateBlogDto.shopId} not found`);
            }
            blog.shop = shop;
        }

        if (updateBlogDto.attachmentIds) {
            blog.attachments = await this.attachmentRepository.findByIds(updateBlogDto.attachmentIds);
        }

        return this.blogRepository.save(blog);
    }

    async deleteBlog(id: number): Promise<void> {
        const result = await this.blogRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }
    }
}

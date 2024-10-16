import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Region } from '../region/entities/region.entity';
import { Tag } from '../tags/entities/tag.entity';
import { CacheService } from '../helpers/cacheService';

@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(Blog)
        private readonly blogRepository: Repository<Blog>,
        @InjectRepository(Region)
        private readonly regionRepository: Repository<Region>,
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>, // Inject Tag repository
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

    ) { }

    async createBlog(createBlogDto: CreateBlogDto): Promise<Blog> {
        const { title, content, shopId, attachmentIds, tagIds, regionName } = createBlogDto;

        // Retrieve attachments if they exist
        const attachments = attachmentIds ? await this.attachmentRepository.findByIds(attachmentIds) : [];

        // Retrieve tags if they exist
        const tags = tagIds ? await this.tagRepository.findByIds(tagIds) : [];

        // Check if the shop exists
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopId} not found`);
        }

        // Check if the region exists
        const region = await this.regionRepository.findOne({ where: { name: regionName } });
        if (!region) {
            throw new NotFoundException(`Region with name ${regionName} not found`);
        }

        // Create and save the blog
        const blog = this.blogRepository.create({
            title,
            content,
            shop,
            attachments,
            tags, // Associate tags with the blog
            region,  // Associate region with the blog
        });

        return this.blogRepository.save(blog);
    }

    async getBlogById(id: number): Promise<Blog> {
        const cacheKey = `blog-${id}`;
        let blog = await this.cacheManager.get<Blog>(cacheKey);

        if (!blog) {
            // Using createQueryBuilder for more control
            blog = await this.blogRepository.createQueryBuilder('blog')
                .leftJoinAndSelect('blog.shop', 'shop')
                .leftJoinAndSelect('blog.attachments', 'attachments')
                .leftJoinAndSelect('blog.tags', 'tags')
                .leftJoinAndSelect('blog.region', 'region')
                .where('blog.id = :id', { id })
                .cache(50000)
                .getOne();

            if (!blog) {
                throw new NotFoundException(`Blog with ID ${id} not found`);
            }

            // Cache for 1 hour (3600 seconds)
            await this.cacheManager.set(cacheKey, blog, 3600);
        }

        return blog;
    }


    async getAllBlogs(
        shopSlug: string,
        regionName: string | any,
        tagName?: string,
        page: number = 1,
        limit: number = 10,
        startDate?: string,
        endDate?: string
    ): Promise<{ data: Blog[], count: number }> {
        const offset = (page - 1) * limit;
        const cacheKey = `blogs-${shopSlug}-${regionName || 'all'}-${tagName || 'all'}-${startDate || 'all'}-${endDate || 'all'}-page${page}-limit${limit}`;

        // Attempt to retrieve from cache
        let cachedData = await this.cacheManager.get<{ data: Blog[], count: number }>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        // Fetch shop by slug using QueryBuilder
        const shop = await this.shopRepository.createQueryBuilder('shop')
            .where('shop.slug = :shopSlug', { shopSlug })
            .getOne();

        if (!shop) {
            throw new NotFoundException(`Shop with slug '${shopSlug}' not found`);
        }

        // Fetch region by name (if provided)
        let region;
        if (regionName) {
            region = await this.regionRepository.createQueryBuilder('region')
                .where('region.name = :regionName', { regionName })
                .getOne();

            if (!region) {
                console.warn(`Warning: Region with name '${regionName}' not found. Proceeding without region filter.`);
            }
        }

        // Build the query for blogs
        const queryBuilder = this.blogRepository.createQueryBuilder('blog')
            .leftJoinAndSelect('blog.shop', 'shop')
            .leftJoinAndSelect('blog.attachments', 'attachments')
            .leftJoinAndSelect('blog.tags', 'tags')
            .leftJoinAndSelect('blog.region', 'region')
            .where('blog.shopId = :shopId', { shopId: shop.id });

        // Apply filters
        if (region) {
            queryBuilder.andWhere('blog.regionId = :regionId', { regionId: region.id });
        }

        if (tagName) {
            queryBuilder.andWhere('tags.name = :tagName', { tagName });
        }

        if (startDate) {
            queryBuilder.andWhere('blog.date >= :startDate', { startDate });
        }

        if (endDate) {
            queryBuilder.andWhere('blog.date <= :endDate', { endDate });
        }

        // Get the total count for pagination
        const count = await queryBuilder.getCount();

        // Fetch the paginated data
        const data = await queryBuilder
            .skip(offset)
            .take(limit)
            .cache(50000)
            .getMany();

        // Cache the result for 1 hour (3600 seconds)
        cachedData = { data, count };
        await this.cacheManager.set(cacheKey, cachedData, 3600);

        return cachedData;
    }


    async updateBlog(id: number, updateBlogDto: UpdateBlogDto): Promise<Blog> {
        const blog = await this.getBlogById(id);

        const { title, content, shopId, attachmentIds, tagIds, regionName } = updateBlogDto;

        // Update title if provided
        if (title) {
            blog.title = title;
        }

        // Update content if provided
        if (content) {
            blog.content = content;
        }

        // Update shop if shopId is provided
        if (shopId) {
            const shop = await this.shopRepository.findOne({ where: { id: shopId } });
            if (!shop) {
                throw new NotFoundException(`Shop with ID ${shopId} not found`);
            }
            blog.shop = shop;
        }

        // Update attachments if attachmentIds are provided
        if (attachmentIds) {
            blog.attachments = await this.attachmentRepository.findByIds(attachmentIds);
        }

        // Update tags if tagIds are provided
        if (tagIds) {
            blog.tags = await this.tagRepository.findByIds(tagIds);
        }

        // Update region if regionName is provided
        if (regionName) {
            const region = await this.regionRepository.findOne({ where: { name: regionName } });
            if (!region) {
                throw new NotFoundException(`Region with name ${regionName} not found`);
            }
            blog.region = region;
        }

        // Save the updated blog entity
        return this.blogRepository.save(blog);
    }

    async deleteBlog(id: number): Promise<void> {
        const result = await this.blogRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }
    }
}
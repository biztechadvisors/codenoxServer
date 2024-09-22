"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const blog_entity_1 = require("./entities/blog.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const region_entity_1 = require("../region/entities/region.entity");
const tag_entity_1 = require("../tags/entities/tag.entity");
let BlogService = class BlogService {
    constructor(blogRepository, regionRepository, attachmentRepository, shopRepository, tagRepository, cacheManager) {
        this.blogRepository = blogRepository;
        this.regionRepository = regionRepository;
        this.attachmentRepository = attachmentRepository;
        this.shopRepository = shopRepository;
        this.tagRepository = tagRepository;
        this.cacheManager = cacheManager;
    }
    async createBlog(createBlogDto) {
        const { title, content, shopId, attachmentIds, tagIds, regionName } = createBlogDto;
        const attachments = attachmentIds ? await this.attachmentRepository.findByIds(attachmentIds) : [];
        const tags = tagIds ? await this.tagRepository.findByIds(tagIds) : [];
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with ID ${shopId} not found`);
        }
        const region = await this.regionRepository.findOne({ where: { name: regionName } });
        if (!region) {
            throw new common_1.NotFoundException(`Region with name ${regionName} not found`);
        }
        const blog = this.blogRepository.create({
            title,
            content,
            shop,
            attachments,
            tags,
            region,
        });
        return this.blogRepository.save(blog);
    }
    async getBlogById(id) {
        const cacheKey = `blog-${id}`;
        let blog = await this.cacheManager.get(cacheKey);
        if (!blog) {
            blog = await this.blogRepository.findOne({
                where: { id },
                relations: ['shop', 'attachments', 'tags', 'region'],
            });
            if (!blog) {
                throw new common_1.NotFoundException(`Blog with ID ${id} not found`);
            }
            await this.cacheManager.set(cacheKey, blog, 60);
        }
        return blog;
    }
    async getAllBlogs(shopSlug, regionName, tagName, page = 1, limit = 10, startDate, endDate) {
        const offset = (page - 1) * limit;
        const cacheKey = `blogs-${shopSlug}-${regionName || 'all'}-${tagName || 'all'}-${startDate || 'all'}-${endDate || 'all'}-page${page}-limit${limit}`;
        let cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with slug '${shopSlug}' not found`);
        }
        let region = null;
        if (regionName) {
            region = await this.regionRepository.findOne({ where: { name: regionName } });
            if (!region) {
                console.warn(`Warning: Region with name '${regionName}' not found. Proceeding without region filter.`);
            }
        }
        const queryBuilder = this.blogRepository.createQueryBuilder('blog')
            .leftJoinAndSelect('blog.shop', 'shop')
            .leftJoinAndSelect('blog.attachments', 'attachments')
            .leftJoinAndSelect('blog.tags', 'tags')
            .leftJoinAndSelect('blog.region', 'region')
            .where('blog.shopId = :shopId', { shopId: shop.id });
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
        const count = await queryBuilder.getCount();
        const data = await queryBuilder
            .skip(offset)
            .take(limit)
            .getMany();
        cachedData = { data, count };
        await this.cacheManager.set(cacheKey, cachedData, 60);
        return cachedData;
    }
    async updateBlog(id, updateBlogDto) {
        const blog = await this.getBlogById(id);
        const { title, content, shopId, attachmentIds, tagIds, regionName } = updateBlogDto;
        if (title) {
            blog.title = title;
        }
        if (content) {
            blog.content = content;
        }
        if (shopId) {
            const shop = await this.shopRepository.findOne({ where: { id: shopId } });
            if (!shop) {
                throw new common_1.NotFoundException(`Shop with ID ${shopId} not found`);
            }
            blog.shop = shop;
        }
        if (attachmentIds) {
            blog.attachments = await this.attachmentRepository.findByIds(attachmentIds);
        }
        if (tagIds) {
            blog.tags = await this.tagRepository.findByIds(tagIds);
        }
        if (regionName) {
            const region = await this.regionRepository.findOne({ where: { name: regionName } });
            if (!region) {
                throw new common_1.NotFoundException(`Region with name ${regionName} not found`);
            }
            blog.region = region;
        }
        return this.blogRepository.save(blog);
    }
    async deleteBlog(id) {
        const result = await this.blogRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Blog with ID ${id} not found`);
        }
    }
};
BlogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(blog_entity_1.Blog)),
    __param(1, (0, typeorm_1.InjectRepository)(region_entity_1.Region)),
    __param(2, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(3, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(4, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __param(5, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], BlogService);
exports.BlogService = BlogService;
//# sourceMappingURL=blog.service.js.map
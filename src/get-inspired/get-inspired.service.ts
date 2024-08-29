// src/get-inspired/get-inspired.service.ts

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetInspired } from './entities/get-inspired.entity';
import { CreateGetInspiredDto, UpdateGetInspiredDto } from './dto/create-get-inspired.dto';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Tag } from '../tags/entities/tag.entity';

@Injectable()
export class GetInspiredService {
    constructor(
        @InjectRepository(GetInspired)
        private readonly getInspiredRepository: Repository<GetInspired>,
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) { }

    async createGetInspired(createGetInspiredDto: CreateGetInspiredDto): Promise<GetInspired> {
        const { title, type, shopId, imageIds = [], tagIds = [] } = createGetInspiredDto;

        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopId} not found`);
        }

        const images = await this.attachmentRepository.findByIds(imageIds);
        const tags = await this.tagRepository.findByIds(tagIds);

        const getInspired = this.getInspiredRepository.create({
            title,
            type,
            shop,
            images,
            tags,
        });

        return this.getInspiredRepository.save(getInspired);
    }

    async getAllGetInspired(
        shopSlug: string,
        type?: string,
        tagIds: number[] = [],
        page: number = 1,
        limit: number = 10
    ): Promise<{ data: GetInspired[], total: number, page: number, limit: number }> {
        const cacheKey = `get-inspired-shop-${shopSlug}-type-${type || 'all'}-tags-${tagIds.join(',')}-page-${page}-limit-${limit}`;
        let cachedResult = await this.cacheManager.get<{ data: GetInspired[], total: number }>(cacheKey);

        if (cachedResult) {
            return {
                ...cachedResult,
                page,
                limit
            };
        }

        // Create query builder for filtering by shop, type, and tags
        const queryBuilder = this.getInspiredRepository.createQueryBuilder('getInspired')
            .innerJoinAndSelect('getInspired.shop', 'shop', 'shop.slug = :slug', { slug: shopSlug })
            .leftJoinAndSelect('getInspired.images', 'images')
            .leftJoinAndSelect('getInspired.tags', 'tags');

        // Filter by type if provided
        if (type) {
            queryBuilder.andWhere('getInspired.type = :type', { type });
        }

        // Filter by tags if provided
        if (tagIds.length > 0) {
            queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds });
        }

        // Calculate pagination parameters
        const skip = (page - 1) * limit;

        // Retrieve data with pagination
        const [data, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const result = { data, total, page, limit };

        // Cache the result for 1 hour
        await this.cacheManager.set(cacheKey, result, 3600);

        return result;
    }

    async getGetInspiredById(id: number): Promise<GetInspired> {
        const cacheKey = `get-inspired-${id}`;
        let getInspired = await this.cacheManager.get<GetInspired>(cacheKey);

        if (!getInspired) {
            getInspired = await this.getInspiredRepository.findOne({
                where: { id },
                relations: ['shop', 'images'],
            });

            if (!getInspired) {
                throw new NotFoundException(`GetInspired with ID ${id} not found`);
            }

            await this.cacheManager.set(cacheKey, getInspired, 3600); // Cache for 1 hour
        }

        return getInspired;
    }

    async updateGetInspired(id: number, updateGetInspiredDto: UpdateGetInspiredDto): Promise<GetInspired> {
        const getInspired = await this.getInspiredRepository.findOne({ where: { id }, relations: ['tags'] });

        if (!getInspired) {
            throw new NotFoundException(`GetInspired with ID ${id} not found`);
        }

        const { title, type, imageIds, tagIds } = updateGetInspiredDto;

        if (title) getInspired.title = title;
        if (type) getInspired.type = type;
        if (imageIds) {
            getInspired.images = await this.attachmentRepository.findByIds(imageIds);
        }
        if (tagIds) {
            getInspired.tags = await this.tagRepository.findByIds(tagIds);
        }

        return this.getInspiredRepository.save(getInspired);
    }

    async deleteGetInspired(id: number): Promise<void> {
        const result = await this.getInspiredRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`GetInspired with ID ${id} not found`);
        }
    }
}

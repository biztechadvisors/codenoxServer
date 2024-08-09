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

@Injectable()
export class GetInspiredService {
    constructor(
        @InjectRepository(GetInspired)
        private readonly getInspiredRepository: Repository<GetInspired>,
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) { }

    async createGetInspired(createGetInspiredDto: CreateGetInspiredDto): Promise<GetInspired> {
        const { title, type, shopId, imageIds } = createGetInspiredDto;

        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopId} not found`);
        }

        const images = await this.attachmentRepository.findByIds(imageIds);

        const getInspired = this.getInspiredRepository.create({
            title,
            type,
            shop,
            images,
        });

        return this.getInspiredRepository.save(getInspired);
    }

    async getAllGetInspired(shopSlug: string): Promise<GetInspired[]> {
        const cacheKey = `get-inspired-shop-${shopSlug}`;
        let getInspiredItems = await this.cacheManager.get<GetInspired[]>(cacheKey);

        if (!getInspiredItems) {
            getInspiredItems = await this.getInspiredRepository
                .createQueryBuilder('getInspired')
                .innerJoinAndSelect('getInspired.shop', 'shop', 'shop.slug = :slug', { slug: shopSlug })
                .leftJoinAndSelect('getInspired.images', 'images')
                .getMany();

            await this.cacheManager.set(cacheKey, getInspiredItems, 3600); // Cache for 1 hour
        }

        return getInspiredItems;
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
        const getInspired = await this.getGetInspiredById(id);

        if (updateGetInspiredDto.title) getInspired.title = updateGetInspiredDto.title;
        if (updateGetInspiredDto.type) getInspired.type = updateGetInspiredDto.type;
        if (updateGetInspiredDto.imageIds) {
            getInspired.images = await this.attachmentRepository.findByIds(updateGetInspiredDto.imageIds);
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

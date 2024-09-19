import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from './entities/career.entity';
import { CreateCareerDto, UpdateCareerDto } from './dto/createcareer.dto';
import { Shop } from '../shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CareerService {
    constructor(
        @InjectRepository(Career)
        private readonly careerRepository: Repository<Career>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

    ) { }

    async createCareer(createCareerDto: CreateCareerDto): Promise<Career> {
        const { shopSlug, ...careerData } = createCareerDto;

        // Check if the shop exists
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopSlug} not found`);
        }

        const career = this.careerRepository.create({ ...careerData, shop });
        return this.careerRepository.save(career);
    }

    async updateCareer(id: number, updateCareerDto: UpdateCareerDto): Promise<Career> {
        const career = await this.getCareerById(id);
        const { shopSlug, ...updateData } = updateCareerDto;

        if (shopSlug) {
            const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
            if (!shop) {
                throw new NotFoundException(`Shop with ID ${shopSlug} not found`);
            }
            career.shop = shop;
        }

        Object.assign(career, updateData);
        return this.careerRepository.save(career);
    }

    async getCareerById(id: number): Promise<Career> {
        const career = await this.careerRepository.findOne({ where: { id }, relations: ['shop'] });
        if (!career) {
            throw new NotFoundException(`Career with ID ${id} not found`);
        }
        return career;
    }

    async deleteCareer(id: number): Promise<void> {
        const career = await this.getCareerById(id);
        await this.careerRepository.remove(career);
    }

    async findAllByShop(
        shopSlug: string,
        location?: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ data: Career[], count: number }> {
        const offset = (page - 1) * limit;
        const cacheKey = `careers-${shopSlug}-${location || 'all'}-page${page}-limit${limit}`;

        // Check cache first
        let cachedData = await this.cacheManager.get<{ data: Career[], count: number }>(cacheKey);
        if (!cachedData) {
            // Find the shop by its slug
            const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
            if (!shop) {
                throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
            }

            // Build query with optional location filter
            const queryBuilder = this.careerRepository.createQueryBuilder('career')
                .leftJoinAndSelect('career.shop', 'shop')
                .where('career.shopId = :shopId', { shopId: shop.id });

            if (location) {
                queryBuilder.andWhere('career.location = :location', { location });
            }

            // Get the total count before applying pagination
            const count = await queryBuilder.getCount();

            // Apply pagination
            const data = await queryBuilder
                .skip(offset)
                .take(limit)
                .getMany();

            // Cache the result
            cachedData = { data, count };
            await this.cacheManager.set(cacheKey, cachedData, 60); // Cache for 1 hour
        }

        return cachedData;
    }


}
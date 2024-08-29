import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { Shop } from '../shops/entities/shop.entity';

@Injectable()
export class RegionService {
    constructor(
        @InjectRepository(Region)
        private readonly regionRepository: Repository<Region>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
    ) { }

    async create(createRegionDto: { name: string; description?: string }): Promise<Region> {
        const region = this.regionRepository.create(createRegionDto);
        return this.regionRepository.save(region);
    }

    async findAll(shopSlug: string): Promise<Region[]> {
        // Fetch the shop by its slug
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
        }

        // Find regions associated with the shop
        return this.regionRepository.find({ where: { shop: { id: shop.id } }, relations: ['shop'] });
    }

    async findOne(id: number): Promise<Region> {
        const region = await this.regionRepository.findOne({ where: { id: id } });
        if (!region) {
            throw new NotFoundException(`Region with id ${id} not found`);
        }
        return region;
    }

    async update(id: number, updateRegionDto: { name?: string; description?: string }): Promise<Region> {
        const region = await this.regionRepository.preload({
            id,
            ...updateRegionDto,
        });

        if (!region) {
            throw new NotFoundException(`Region with id ${id} not found`);
        }

        return this.regionRepository.save(region);
    }

    async remove(id: number): Promise<void> {
        const result = await this.regionRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Region with id ${id} not found`);
        }
    }
}

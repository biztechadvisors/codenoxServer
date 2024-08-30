import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { Shop } from '../shops/entities/shop.entity';
import { CreateRegionDto, UpdateRegionDto } from './dto/create-region.dto';

@Injectable()
export class RegionService {
    constructor(
        @InjectRepository(Region)
        private readonly regionRepository: Repository<Region>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
    ) { }

    async create(createRegionDto: CreateRegionDto): Promise<Region> {
        const { shop: shopIds, ...regionData } = createRegionDto;

        let shops: Shop[] = [];
        if (shopIds) {
            shops = await this.shopRepository.findByIds(shopIds);
            if (shops.length !== shopIds.length) {
                throw new NotFoundException(`One or more shops not found`);
            }
        }

        const region = this.regionRepository.create({
            ...regionData,
            shop: shops,
        });

        return this.regionRepository.save(region);
    }

    async findAllRegionByShop(shopSlug: string): Promise<Region[]> {
        const shop = await this.shopRepository.findOne({
            where: { slug: shopSlug },
            relations: ['regions'],
        });

        if (!shop) {
            throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
        }

        return shop.regions;
    }

    async findOne(id: number): Promise<Region> {
        const region = await this.regionRepository.findOne({ where: { id }, relations: ['shop'] });

        if (!region) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }

        return region;
    }

    async update(id: number, updateRegionDto: UpdateRegionDto): Promise<Region> {
        const { shop: shopIds, ...regionData } = updateRegionDto;

        let shops: Shop[] = [];
        if (shopIds) {
            shops = await this.shopRepository.findByIds(shopIds);
            if (shops.length !== shopIds.length) {
                throw new NotFoundException(`One or more shops not found`);
            }
        }

        const region = await this.regionRepository.preload({
            id,
            ...regionData,
            shop: shops,
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }

        return this.regionRepository.save(region);
    }

    async remove(id: number): Promise<void> {
        const result = await this.regionRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }
    }
}

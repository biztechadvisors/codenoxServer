import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, QueryFailedError, Repository } from 'typeorm';
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

    async createRegion(createRegionDto: CreateRegionDto): Promise<Region> {
        const { name, shop_id } = createRegionDto;
        const shop = await this.shopRepository.findOne({ where: { id: shop_id } })
        const region = new Region()

        region.name = name;
        region.shops = [shop]

        // Create the new region and associate the shops
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
        const region = await this.regionRepository.findOne({ where: { id } });

        if (!region) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }

        return region;
    }

    async update(id: number, updateRegionDto: UpdateRegionDto): Promise<Region> {
        const { shop_id, name } = updateRegionDto;

        const region = await this.regionRepository.findOne({ where: { id } });

        if (!region) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }

        try {

            region.name = updateRegionDto.name
            return await this.regionRepository.save(region);
        } catch (error) {
            if (error instanceof QueryFailedError && error.message.includes('Duplicate entry')) {
                throw new ConflictException(`Region with name '${name}' already exists`);
            }
            throw error;
        }
    }

    async remove(id: number): Promise<void> {
        const result = await this.regionRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }
    }
}

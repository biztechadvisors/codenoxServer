import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';

@Injectable()
export class RegionService {
    constructor(
        @InjectRepository(Region)
        private readonly regionRepository: Repository<Region>,
    ) { }

    async create(createRegionDto: { name: string; description?: string }): Promise<Region> {
        const region = this.regionRepository.create(createRegionDto);
        return this.regionRepository.save(region);
    }

    async findAll(): Promise<Region[]> {
        return this.regionRepository.find();
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

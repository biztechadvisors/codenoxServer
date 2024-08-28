import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from './entities/career.entity';
import { CreateCareerDto, UpdateCareerDto } from './dto/createcareer.dto';
import { Shop } from '../shops/entities/shop.entity';

@Injectable()
export class CareerService {
    constructor(
        @InjectRepository(Career)
        private readonly careerRepository: Repository<Career>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
    ) { }

    async createCareer(createCareerDto: CreateCareerDto): Promise<Career> {
        const { shopId, ...careerData } = createCareerDto;

        // Check if the shop exists
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopId} not found`);
        }

        const career = this.careerRepository.create({ ...careerData, shop });
        return this.careerRepository.save(career);
    }

    async updateCareer(id: number, updateCareerDto: UpdateCareerDto): Promise<Career> {
        const career = await this.getCareerById(id);
        const { shopId, ...updateData } = updateCareerDto;

        if (shopId) {
            const shop = await this.shopRepository.findOne({ where: { id: shopId } });
            if (!shop) {
                throw new NotFoundException(`Shop with ID ${shopId} not found`);
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

    async findAllByShop(shopSlug: string): Promise<Career[]> {
        // Find the shop by its slug
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
        }

        // Fetch all careers related to the shop
        return this.careerRepository.find({ where: { shop: { id: shop.id } }, relations: ['shop'] });
    }
}
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from './entities/career.entity';
import { CreateCareerDto, UpdateCareerDto } from './dto/createcareer.dto';
import { Shop } from '../shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Vacancy } from './entities/vacancies.entity';
import { CreateVacancyDto, UpdateVacancyDto } from './dto/createvacancy.dto';
import { Add } from '../address/entities/address.entity';
import { CacheService } from '../helpers/cacheService';

@Injectable()
export class CareerService {
    constructor(
        @InjectRepository(Career)
        private readonly careerRepository: Repository<Career>,
        @InjectRepository(Vacancy)
        private readonly vacancyRepository: Repository<Vacancy>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(Add)
        private readonly addressRepository: Repository<Add>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

    ) { }

    async createCareer(createCareerDto: CreateCareerDto): Promise<Career> {
        const { shopSlug, locationId, vacancyId, ...careerData } = createCareerDto;

        // Check if the shop exists
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
        }

        // Find the address (location)
        const address = await this.addressRepository.findOne({ where: { id: locationId } });
        if (!address) {
            throw new NotFoundException(`Address with ID ${locationId} not found`);
        }

        // Find the specific vacancy
        const vacancy = await this.vacancyRepository.findOne({ where: { id: vacancyId, shop: { id: shop.id } } });
        if (!vacancy) {
            throw new NotFoundException(`Vacancy with ID ${vacancyId} not found in shop ${shopSlug}`);
        }

        // Create the career and link it to the shop and vacancy
        const career = this.careerRepository.create({ ...careerData, shop, vacancy });
        return this.careerRepository.save(career);
    }

    async updateCareer(id: number, updateCareerDto: UpdateCareerDto): Promise<Career> {
        const career = await this.getCareerById(id);
        const { shopSlug, ...updateData } = updateCareerDto;

        if (shopSlug) {
            const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
            if (!shop) {
                throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
            }
            career.shop = shop;
        }

        Object.assign(career, updateData);
        return this.careerRepository.save(career);
    }

    async getCareerById(id: number): Promise<Career> {
        const cacheKey = `career_${id}`;

        // Try to get the data from cache first
        let career = await this.cacheManager.get<Career>(cacheKey);
        if (!career) {
            career = await this.careerRepository.findOne({ where: { id }, relations: ['shop', 'vacancy'] });
            if (!career) {
                throw new NotFoundException(`Career with ID ${id} not found`);
            }

            // Cache the result
            await this.cacheManager.set(cacheKey, career, 300); // Cache for 5 minutes
        }
        return career;
    }

    async findAllByShop(
        shopSlug: string,
        location?: string,
        vacancyTitle?: string,
        position?: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ data: Career[], count: number }> {
        const cacheKey = `careers_${shopSlug}_${page}_${limit}_${location || 'all'}_${vacancyTitle || 'all'}_${position || 'all'}`;

        // Try to get the data from cache first
        let cachedResult = await this.cacheManager.get<{ data: Career[], count: number }>(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        const offset = (page - 1) * limit;
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
        }

        const queryBuilder = this.careerRepository.createQueryBuilder('career')
            .leftJoinAndSelect('career.vacancy', 'vacancy')
            .where('career.shopId = :shopId', { shopId: shop.id });

        if (location) {
            queryBuilder.andWhere('career.location = :location', { location });
        }

        if (vacancyTitle) {
            queryBuilder.andWhere('vacancy.title ILIKE :vacancyTitle', { vacancyTitle: `%${vacancyTitle}%` });
        }

        if (position) {
            queryBuilder.andWhere('career.position ILIKE :position', { position: `%${position}%` });
        }

        const count = await queryBuilder.getCount();
        const data = await queryBuilder.skip(offset).take(limit).getMany();

        // Cache the result
        cachedResult = { data, count };
        await this.cacheManager.set(cacheKey, cachedResult, 300); // Cache for 5 minutes

        return cachedResult;
    }
    async deleteCareer(id: number): Promise<void> {
        const career = await this.getCareerById(id);
        await this.careerRepository.remove(career);
    }

    async createVacancy(createVacancyDto: CreateVacancyDto): Promise<Vacancy> {
        const { locationId, shopId, careerId, ...vacancyData } = createVacancyDto;

        // Find the location (address) by ID
        const location = await this.addressRepository.findOne({ where: { id: locationId } });
        if (!location) {
            throw new NotFoundException(`Address with ID ${locationId} not found`);
        }

        // Find the shop by ID
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopId} not found`);
        }

        // Optionally find the career by ID if provided
        let career: Career | undefined;
        if (careerId) {
            career = await this.careerRepository.findOne({ where: { id: careerId } });
            if (!career) {
                throw new NotFoundException(`Career with ID ${careerId} not found`);
            }
        }

        // Create the vacancy and link it to the shop, location, and optional career
        const vacancy = this.vacancyRepository.create({
            ...vacancyData,
            location,
            shop,
            career: career ? [career] : [],
        });

        return this.vacancyRepository.save(vacancy);
    }

    async updateVacancy(id: number, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy> {
        const vacancy = await this.vacancyRepository.findOne({ where: { id }, relations: ['location', 'shop', 'career'] });
        if (!vacancy) {
            throw new NotFoundException('Vacancy not found');
        }

        const { locationId, shopId, careerId, ...updateData } = updateVacancyDto;

        // Update location if locationId is provided
        if (locationId) {
            const location = await this.addressRepository.findOne({ where: { id: locationId } });
            if (!location) {
                throw new NotFoundException(`Address with ID ${locationId} not found`);
            }
            vacancy.location = location;
        }

        // Update shop if shopId is provided
        if (shopId) {
            const shop = await this.shopRepository.findOne({ where: { id: shopId } });
            if (!shop) {
                throw new NotFoundException(`Shop with ID ${shopId} not found`);
            }
            vacancy.shop = shop;
        }

        // Update career if careerId is provided
        if (careerId) {
            const career = await this.careerRepository.findOne({ where: { id: careerId } });
            if (!career) {
                throw new NotFoundException(`Career with ID ${careerId} not found`);
            }
            vacancy.career = [career];
        }

        // Update other properties
        Object.assign(vacancy, updateData);

        return this.vacancyRepository.save(vacancy);
    }

    async findVacancyById(id: number): Promise<Vacancy> {
        const cacheKey = `vacancy_${id}`;

        // Try to get the data from cache first
        let vacancy = await this.cacheManager.get<Vacancy>(cacheKey);
        if (!vacancy) {
            vacancy = await this.vacancyRepository.findOne({ where: { id }, relations: ['location', 'shop', 'career'] });
            if (!vacancy) {
                throw new NotFoundException('Vacancy not found');
            }

            // Cache the result
            await this.cacheManager.set(cacheKey, vacancy, 300); // Cache for 5 minutes
        }
        return vacancy;
    }

    async deleteVacancy(id: number): Promise<void> {
        const result = await this.vacancyRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Vacancy not found');
        }
    }

    async findAllVacancies(page: number, limit: number, city?: string): Promise<{ data: Vacancy[], count: number }> {
        const cacheKey = `vacancies_${page}_${limit}_${city || 'all'}`;

        // Try to get the data from cache first
        let cachedResult = await this.cacheManager.get<{ data: Vacancy[], count: number }>(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        const queryBuilder = this.vacancyRepository.createQueryBuilder('vacancy')
            .leftJoinAndSelect('vacancy.location', 'address')
            .leftJoinAndSelect('vacancy.shop', 'shop');

        if (city) {
            queryBuilder.andWhere('address.city = :city', { city });
        }

        const [data, count] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        // Cache the result
        cachedResult = { data, count };
        await this.cacheManager.set(cacheKey, cachedResult, 300); // Cache for 5 minutes

        return cachedResult;
    }

}

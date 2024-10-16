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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const career_entity_1 = require("./entities/career.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const vacancies_entity_1 = require("./entities/vacancies.entity");
const address_entity_1 = require("../address/entities/address.entity");
let CareerService = class CareerService {
    constructor(careerRepository, vacancyRepository, shopRepository, addressRepository, cacheManager) {
        this.careerRepository = careerRepository;
        this.vacancyRepository = vacancyRepository;
        this.shopRepository = shopRepository;
        this.addressRepository = addressRepository;
        this.cacheManager = cacheManager;
    }
    async createCareer(createCareerDto) {
        const { shopSlug, locationId, vacancyId } = createCareerDto, careerData = __rest(createCareerDto, ["shopSlug", "locationId", "vacancyId"]);
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with slug ${shopSlug} not found`);
        }
        const address = await this.addressRepository.findOne({ where: { id: locationId } });
        if (!address) {
            throw new common_1.NotFoundException(`Address with ID ${locationId} not found`);
        }
        const vacancy = await this.vacancyRepository.findOne({ where: { id: vacancyId, shop: { id: shop.id } } });
        if (!vacancy) {
            throw new common_1.NotFoundException(`Vacancy with ID ${vacancyId} not found in shop ${shopSlug}`);
        }
        const career = this.careerRepository.create(Object.assign(Object.assign({}, careerData), { shop, vacancy }));
        return this.careerRepository.save(career);
    }
    async updateCareer(id, updateCareerDto) {
        const career = await this.getCareerById(id);
        const { shopSlug } = updateCareerDto, updateData = __rest(updateCareerDto, ["shopSlug"]);
        if (shopSlug) {
            const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
            if (!shop) {
                throw new common_1.NotFoundException(`Shop with slug ${shopSlug} not found`);
            }
            career.shop = shop;
        }
        Object.assign(career, updateData);
        return this.careerRepository.save(career);
    }
    async getCareerById(id) {
        const cacheKey = `career_${id}`;
        let career = await this.cacheManager.get(cacheKey);
        if (!career) {
            career = await this.careerRepository.createQueryBuilder('career')
                .leftJoinAndSelect('career.shop', 'shop')
                .leftJoinAndSelect('career.vacancy', 'vacancy')
                .where('career.id = :id', { id })
                .cache(50000)
                .getOne();
            if (!career) {
                throw new common_1.NotFoundException(`Career with ID ${id} not found`);
            }
            await this.cacheManager.set(cacheKey, career, 300);
        }
        return career;
    }
    async findAllByShop(shopSlug, location, vacancyTitle, position, page = 1, limit = 10) {
        const cacheKey = `careers_${shopSlug}_${page}_${limit}_${location || 'all'}_${vacancyTitle || 'all'}_${position || 'all'}`;
        let cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        const offset = (page - 1) * limit;
        const shop = await this.shopRepository.createQueryBuilder('shop')
            .where('shop.slug = :shopSlug', { shopSlug })
            .getOne();
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with slug ${shopSlug} not found`);
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
        const data = await queryBuilder
            .skip(offset)
            .take(limit)
            .cache(50000)
            .getMany();
        cachedResult = { data, count };
        await this.cacheManager.set(cacheKey, cachedResult, 300);
        return cachedResult;
    }
    async deleteCareer(id) {
        const career = await this.getCareerById(id);
        await this.careerRepository.remove(career);
    }
    async createVacancy(createVacancyDto) {
        const { locationId, shopId, careerId } = createVacancyDto, vacancyData = __rest(createVacancyDto, ["locationId", "shopId", "careerId"]);
        const location = await this.addressRepository.findOne({ where: { id: locationId } });
        if (!location) {
            throw new common_1.NotFoundException(`Address with ID ${locationId} not found`);
        }
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with ID ${shopId} not found`);
        }
        let career;
        if (careerId) {
            career = await this.careerRepository.findOne({ where: { id: careerId } });
            if (!career) {
                throw new common_1.NotFoundException(`Career with ID ${careerId} not found`);
            }
        }
        const vacancy = this.vacancyRepository.create(Object.assign(Object.assign({}, vacancyData), { location,
            shop, career: career ? [career] : [] }));
        return this.vacancyRepository.save(vacancy);
    }
    async updateVacancy(id, updateVacancyDto) {
        const vacancy = await this.vacancyRepository.findOne({ where: { id }, relations: ['location', 'shop', 'career'] });
        if (!vacancy) {
            throw new common_1.NotFoundException('Vacancy not found');
        }
        const { locationId, shopId, careerId } = updateVacancyDto, updateData = __rest(updateVacancyDto, ["locationId", "shopId", "careerId"]);
        if (locationId) {
            const location = await this.addressRepository.findOne({ where: { id: locationId } });
            if (!location) {
                throw new common_1.NotFoundException(`Address with ID ${locationId} not found`);
            }
            vacancy.location = location;
        }
        if (shopId) {
            const shop = await this.shopRepository.findOne({ where: { id: shopId } });
            if (!shop) {
                throw new common_1.NotFoundException(`Shop with ID ${shopId} not found`);
            }
            vacancy.shop = shop;
        }
        if (careerId) {
            const career = await this.careerRepository.findOne({ where: { id: careerId } });
            if (!career) {
                throw new common_1.NotFoundException(`Career with ID ${careerId} not found`);
            }
            vacancy.career = [career];
        }
        Object.assign(vacancy, updateData);
        return this.vacancyRepository.save(vacancy);
    }
    async findVacancyById(id) {
        const cacheKey = `vacancy_${id}`;
        let vacancy = await this.cacheManager.get(cacheKey);
        if (!vacancy) {
            vacancy = await this.vacancyRepository.createQueryBuilder('vacancy')
                .leftJoinAndSelect('vacancy.location', 'location')
                .leftJoinAndSelect('vacancy.shop', 'shop')
                .leftJoinAndSelect('vacancy.career', 'career')
                .where('vacancy.id = :id', { id })
                .cache(50000)
                .getOne();
            if (!vacancy) {
                throw new common_1.NotFoundException('Vacancy not found');
            }
            await this.cacheManager.set(cacheKey, vacancy, 300);
        }
        return vacancy;
    }
    async deleteVacancy(id) {
        const result = await this.vacancyRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('Vacancy not found');
        }
    }
    async findAllVacancies(page = 1, limit = 10, city) {
        const cacheKey = `vacancies_${page}_${limit}_${city || 'all'}`;
        let cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        const offset = (page - 1) * limit;
        const queryBuilder = this.vacancyRepository.createQueryBuilder('vacancy')
            .leftJoinAndSelect('vacancy.location', 'location')
            .leftJoinAndSelect('vacancy.shop', 'shop');
        if (city) {
            queryBuilder.andWhere('location.city = :city', { city });
        }
        const [data, count] = await queryBuilder
            .skip(offset)
            .take(limit)
            .cache(50000)
            .getManyAndCount();
        cachedResult = { data, count };
        await this.cacheManager.set(cacheKey, cachedResult, 300);
        return cachedResult;
    }
};
CareerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(career_entity_1.Career)),
    __param(1, (0, typeorm_1.InjectRepository)(vacancies_entity_1.Vacancy)),
    __param(2, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(3, (0, typeorm_1.InjectRepository)(address_entity_1.Add)),
    __param(4, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], CareerService);
exports.CareerService = CareerService;
//# sourceMappingURL=career.service.js.map
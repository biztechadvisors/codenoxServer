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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const region_entity_1 = require("./entities/region.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
let RegionService = class RegionService {
    constructor(regionRepository, shopRepository) {
        this.regionRepository = regionRepository;
        this.shopRepository = shopRepository;
    }
    async createRegion(createRegionDto) {
        const { name, shop_id } = createRegionDto;
        const shop = await this.shopRepository.findOne({ where: { id: shop_id } });
        const region = new region_entity_1.Region();
        region.name = name;
        region.shops = [shop];
        return this.regionRepository.save(region);
    }
    async findAllRegionByShop(shopSlug) {
        const shop = await this.shopRepository.findOne({
            where: { slug: shopSlug },
            relations: ['regions'],
        });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with slug ${shopSlug} not found`);
        }
        return shop.regions;
    }
    async findOne(id) {
        const region = await this.regionRepository.findOne({ where: { id } });
        if (!region) {
            throw new common_1.NotFoundException(`Region with ID ${id} not found`);
        }
        return region;
    }
    async update(id, updateRegionDto) {
        const { shop_id, name } = updateRegionDto;
        const region = await this.regionRepository.findOne({ where: { id } });
        if (!region) {
            throw new common_1.NotFoundException(`Region with ID ${id} not found`);
        }
        try {
            region.name = updateRegionDto.name;
            return await this.regionRepository.save(region);
        }
        catch (error) {
            if (error instanceof typeorm_2.QueryFailedError && error.message.includes('Duplicate entry')) {
                throw new common_1.ConflictException(`Region with name '${name}' already exists`);
            }
            throw error;
        }
    }
    async remove(id) {
        const result = await this.regionRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Region with ID ${id} not found`);
        }
    }
};
RegionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(region_entity_1.Region)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RegionService);
exports.RegionService = RegionService;
//# sourceMappingURL=region.service.js.map
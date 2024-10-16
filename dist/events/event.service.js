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
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("./entities/event.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const region_entity_1 = require("../region/entities/region.entity");
let EventService = class EventService {
    constructor(eventRepository, shopRepository, regionRepository, attachmentRepository, cacheManager) {
        this.eventRepository = eventRepository;
        this.shopRepository = shopRepository;
        this.regionRepository = regionRepository;
        this.attachmentRepository = attachmentRepository;
        this.cacheManager = cacheManager;
    }
    async createEvent(createEventDto) {
        const { title, eventName, description, date, time, location, collaboration, shopId, imageIds, regionName } = createEventDto;
        const images = imageIds ? await this.attachmentRepository.findByIds(imageIds) : [];
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with ID ${shopId} not found`);
        }
        const region = await this.regionRepository.findOne({ where: { name: regionName } });
        if (!region) {
            throw new common_1.NotFoundException(`Region with name ${regionName} not found`);
        }
        const event = this.eventRepository.create({
            title,
            eventName,
            description,
            date,
            time,
            location,
            collaboration,
            shop,
            images,
            region,
        });
        return this.eventRepository.save(event);
    }
    async getEventById(id) {
        const cacheKey = `event-${id}`;
        let event = await this.cacheManager.get(cacheKey);
        if (!event) {
            event = await this.eventRepository.createQueryBuilder('event')
                .leftJoinAndSelect('event.shop', 'shop')
                .leftJoinAndSelect('event.images', 'images')
                .where('event.id = :id', { id })
                .cache(50000)
                .getOne();
            if (!event) {
                throw new common_1.NotFoundException(`Event with ID ${id} not found`);
            }
            await this.cacheManager.set(cacheKey, event, 60);
        }
        return event;
    }
    async getAllEvents(shopSlug, regionName, page = 1, limit = 10, filter, startDate, endDate, location) {
        const cacheKey = `events-${shopSlug}-${regionName || 'all'}-page-${page}-limit-${limit}-filter-${filter || 'all'}-startDate-${startDate || 'none'}-endDate-${endDate || 'none'}-location-${location || 'none'}`;
        const cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            return Object.assign(Object.assign({}, cachedResult), { page, limit });
        }
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with slug '${shopSlug}' not found`);
        }
        const now = new Date();
        const skip = (page - 1) * limit;
        const queryBuilder = this.eventRepository.createQueryBuilder('event')
            .leftJoinAndSelect('event.shop', 'shop')
            .leftJoinAndSelect('event.images', 'images')
            .where('event.shopId = :shopId', { shopId: shop.id });
        if (regionName) {
            const region = await this.regionRepository.findOne({ where: { name: regionName } });
            if (region) {
                queryBuilder.andWhere('event.regionId = :regionId', { regionId: region.id });
            }
            else {
                console.warn(`Warning: Region with name '${regionName}' not found. Proceeding without region filter.`);
            }
        }
        if (filter === 'upcoming') {
            queryBuilder.andWhere('event.date > :now', { now });
        }
        else if (filter === 'past') {
            queryBuilder.andWhere('event.date < :now', { now });
        }
        else if (filter === 'latest') {
            queryBuilder.orderBy('event.date', 'DESC');
        }
        if (startDate) {
            queryBuilder.andWhere('event.date >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('event.date <= :endDate', { endDate });
        }
        if (location) {
            queryBuilder.andWhere('event.location LIKE :location', { location: `%${location}%` });
        }
        const [data, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .cache(50000)
            .getManyAndCount();
        const result = { data, total, page, limit };
        await this.cacheManager.set(cacheKey, result, 3600);
        return result;
    }
    async updateEvent(id, updateEventDto) {
        const event = await this.getEventById(id);
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found`);
        }
        if (updateEventDto.title)
            event.title = updateEventDto.title;
        if (updateEventDto.eventName)
            event.eventName = updateEventDto.eventName;
        if (updateEventDto.description)
            event.description = updateEventDto.description;
        if (updateEventDto.date)
            event.date = updateEventDto.date;
        if (updateEventDto.time)
            event.time = updateEventDto.time;
        if (updateEventDto.location)
            event.location = updateEventDto.location;
        if (updateEventDto.collaboration)
            event.collaboration = updateEventDto.collaboration;
        if (updateEventDto.shopId) {
            const shop = await this.shopRepository.findOne({ where: { id: updateEventDto.shopId } });
            if (!shop) {
                throw new common_1.NotFoundException(`Shop with ID ${updateEventDto.shopId} not found`);
            }
            event.shop = shop;
        }
        if (updateEventDto.imageIds) {
            const images = await this.attachmentRepository.findByIds(updateEventDto.imageIds);
            if (images.length !== updateEventDto.imageIds.length) {
                throw new common_1.NotFoundException('One or more images not found');
            }
            event.images = images;
        }
        if (updateEventDto.regionName) {
            const region = await this.regionRepository.findOne({ where: { name: updateEventDto.regionName } });
            if (!region) {
                throw new common_1.NotFoundException(`Region with name '${updateEventDto.regionName}' not found`);
            }
            event.region = region;
        }
        return this.eventRepository.save(event);
    }
    async deleteEvent(id) {
        const result = await this.eventRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found`);
        }
    }
};
EventService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(2, (0, typeorm_1.InjectRepository)(region_entity_1.Region)),
    __param(3, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(4, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], EventService);
exports.EventService = EventService;
//# sourceMappingURL=event.service.js.map
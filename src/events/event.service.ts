import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Region } from '../region/entities/region.entity';

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(Region)
        private readonly regionRepository: Repository<Region>,
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

    ) { }

    async createEvent(createEventDto: CreateEventDto): Promise<Event> {
        const { title, eventName, description, date, time, location, collaboration, shopId, imageIds, regionName } = createEventDto;

        // Retrieve images if they exist
        const images = imageIds ? await this.attachmentRepository.findByIds(imageIds) : [];

        // Check if the shop exists
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopId} not found`);
        }

        // Check if the region exists
        const region = await this.regionRepository.findOne({ where: { name: regionName } });
        if (!region) {
            throw new NotFoundException(`Region with name ${regionName} not found`);
        }

        // Create and save the event
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
            region,  // Associate region with the event
        });

        return this.eventRepository.save(event);
    }


    async getEventById(id: number): Promise<Event> {
        const cacheKey = `event-${id}`;
        let event = await this.cacheManager.get<Event>(cacheKey);

        if (!event) {
            event = await this.eventRepository.createQueryBuilder('event')
                .leftJoinAndSelect('event.shop', 'shop')
                .leftJoinAndSelect('event.images', 'images')
                .where('event.id = :id', { id })
                .cache(50000)
                .getOne();

            if (!event) {
                throw new NotFoundException(`Event with ID ${id} not found`);
            }

            await this.cacheManager.set(cacheKey, event, 60); // Cache for 1 hour
        }

        return event;
    }

    async getAllEvents(
        shopSlug: string,
        regionName?: string,
        page: number = 1,
        limit: number = 10,
        filter?: 'upcoming' | 'latest' | 'past',
        startDate?: string,
        endDate?: string,
        location?: string
    ): Promise<{ data: Event[], total: number, page: number, limit: number }> {
        const cacheKey = `events-${shopSlug}-${regionName || 'all'}-page-${page}-limit-${limit}-filter-${filter || 'all'}-startDate-${startDate || 'none'}-endDate-${endDate || 'none'}-location-${location || 'none'}`;

        const cachedResult = await this.cacheManager.get<{ data: Event[], total: number }>(cacheKey);
        if (cachedResult) {
            return { ...cachedResult, page, limit };
        }

        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new NotFoundException(`Shop with slug '${shopSlug}' not found`);
        }

        const now = new Date();
        const skip = (page - 1) * limit;

        // Build the query
        const queryBuilder = this.eventRepository.createQueryBuilder('event')
            .leftJoinAndSelect('event.shop', 'shop')
            .leftJoinAndSelect('event.images', 'images')
            .where('event.shopId = :shopId', { shopId: shop.id });

        // Apply region filter if regionName is provided
        if (regionName) {
            const region = await this.regionRepository.findOne({ where: { name: regionName } });
            if (region) {
                queryBuilder.andWhere('event.regionId = :regionId', { regionId: region.id });
            } else {
                console.warn(`Warning: Region with name '${regionName}' not found. Proceeding without region filter.`);
            }
        }

        // Apply filters based on the filter parameter
        if (filter === 'upcoming') {
            queryBuilder.andWhere('event.date > :now', { now });
        } else if (filter === 'past') {
            queryBuilder.andWhere('event.date < :now', { now });
        } else if (filter === 'latest') {
            queryBuilder.orderBy('event.date', 'DESC');
        }

        // Apply date range filter if provided
        if (startDate) {
            queryBuilder.andWhere('event.date >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('event.date <= :endDate', { endDate });
        }

        // Apply location filter if provided
        if (location) {
            queryBuilder.andWhere('event.location LIKE :location', { location: `%${location}%` });
        }

        // Fetch data with pagination
        const [data, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .cache(50000)
            .getManyAndCount();

        const result = { data, total, page, limit };

        // Cache the result for 1 hour (3600 seconds)
        await this.cacheManager.set(cacheKey, result, 3600); // Cache for 1 hour

        return result;
    }


    async updateEvent(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
        const event = await this.getEventById(id);

        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }

        if (updateEventDto.title) event.title = updateEventDto.title;
        if (updateEventDto.eventName) event.eventName = updateEventDto.eventName;
        if (updateEventDto.description) event.description = updateEventDto.description;
        if (updateEventDto.date) event.date = updateEventDto.date;
        if (updateEventDto.time) event.time = updateEventDto.time;
        if (updateEventDto.location) event.location = updateEventDto.location;
        if (updateEventDto.collaboration) event.collaboration = updateEventDto.collaboration;

        if (updateEventDto.shopId) {
            const shop = await this.shopRepository.findOne({ where: { id: updateEventDto.shopId } });
            if (!shop) {
                throw new NotFoundException(`Shop with ID ${updateEventDto.shopId} not found`);
            }
            event.shop = shop;
        }

        if (updateEventDto.imageIds) {
            const images = await this.attachmentRepository.findByIds(updateEventDto.imageIds);
            if (images.length !== updateEventDto.imageIds.length) {
                throw new NotFoundException('One or more images not found');
            }
            event.images = images;
        }

        if (updateEventDto.regionName) {
            const region = await this.regionRepository.findOne({ where: { name: updateEventDto.regionName } });
            if (!region) {
                throw new NotFoundException(`Region with name '${updateEventDto.regionName}' not found`);
            }
            event.region = region;
        }

        return this.eventRepository.save(event);
    }

    async deleteEvent(id: number): Promise<void> {
        const result = await this.eventRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
    }
}

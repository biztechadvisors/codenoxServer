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
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
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
            event = await this.eventRepository.findOne({
                where: { id },
                relations: ['shop', 'images'],
            });

            if (!event) {
                throw new NotFoundException(`Event with ID ${id} not found`);
            }

            await this.cacheManager.set(cacheKey, event, 3600); // Cache for 1 hour
        }

        return event;
    }

    async getAllEvents(shopSlug: string, regionName: string): Promise<Event[]> {
        const cacheKey = `events-${shopSlug}-${regionName}`;
        let events = await this.cacheManager.get<Event[]>(cacheKey);

        if (!events) {
            // Check if the shop exists
            const shop = await this.shopRepository.findOne({ where: { slug: shopSlug }, relations: ['events'] });
            if (!shop) {
                throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
            }

            // Check if the region exists
            const region = await this.regionRepository.findOne({ where: { name: regionName } });
            if (!region) {
                throw new NotFoundException(`Region with name ${regionName} not found`);
            }

            // Retrieve events filtered by shop and region
            events = await this.eventRepository.find({
                where: { shop: { id: shop.id }, region: { id: region.id } },
                relations: ['shop', 'images', 'region'],
            });

            await this.cacheManager.set(cacheKey, events, 3600); // Cache for 1 hour
        }

        return events;
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

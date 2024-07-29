import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Attachment } from 'src/common/entities/attachment.entity';

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,
    ) { }

    async createEvent(createEventDto: CreateEventDto): Promise<Event> {
        const { title, eventName, description, date, time, location, collaboration, shopId, imageIds } = createEventDto;

        const images = imageIds ? await this.attachmentRepository.findByIds(imageIds) : [];
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });

        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopId} not found`);
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
        });

        return this.eventRepository.save(event);
    }

    async getEventById(id: number): Promise<Event> {
        const event = await this.eventRepository.findOne({
            where: { id },
            relations: ['shop', 'images'],
        });

        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }

        return event;
    }

    async getAllEvents(shopSlug: string): Promise<Event[]> {
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug }, relations: ['events'] });
        if (!shop) {
            throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
        }

        return this.eventRepository.find({
            where: { shop: { id: shop.id } },
            relations: ['shop', 'images'],
        });
    }

    async updateEvent(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
        const event = await this.getEventById(id);

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
            event.images = await this.attachmentRepository.findByIds(updateEventDto.imageIds);
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

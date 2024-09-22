import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Cache } from 'cache-manager';
import { Region } from '../region/entities/region.entity';
export declare class EventService {
    private readonly eventRepository;
    private readonly shopRepository;
    private readonly regionRepository;
    private readonly attachmentRepository;
    private readonly cacheManager;
    constructor(eventRepository: Repository<Event>, shopRepository: Repository<Shop>, regionRepository: Repository<Region>, attachmentRepository: Repository<Attachment>, cacheManager: Cache);
    createEvent(createEventDto: CreateEventDto): Promise<Event>;
    getEventById(id: number): Promise<Event>;
    getAllEvents(shopSlug: string, regionName: string | any, page?: number, limit?: number, filter?: 'upcoming' | 'latest' | 'past', startDate?: string, endDate?: string, location?: string): Promise<{
        data: Event[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateEvent(id: number, updateEventDto: UpdateEventDto): Promise<Event>;
    deleteEvent(id: number): Promise<void>;
}

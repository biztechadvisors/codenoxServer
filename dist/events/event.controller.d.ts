import { EventService } from './event.service';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CacheService } from '../helpers/cacheService';
export declare class EventController {
    private readonly eventService;
    private readonly cacheService;
    constructor(eventService: EventService, cacheService: CacheService);
    createEvent(createEventDto: CreateEventDto): Promise<Event>;
    getAllEvents(shopSlug: string, regionName: string | any, page?: number, limit?: number, filter?: 'upcoming' | 'latest' | 'past', startDate?: string, endDate?: string, location?: string): Promise<{
        data: Event[];
        total: number;
        page: number;
        limit: number;
    }>;
    getEventById(id: number): Promise<Event>;
    updateEvent(id: number, updateEventDto: UpdateEventDto): Promise<Event>;
    deleteEvent(id: number): Promise<void>;
}

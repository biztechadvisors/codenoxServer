import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CacheService } from '../helpers/cacheService';

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService, private readonly cacheService: CacheService) { }

    @Post()
    async createEvent(@Body() createEventDto: CreateEventDto): Promise<Event> {
        await this.cacheService.invalidateCacheBySubstring("events/shop")
        return this.eventService.createEvent(createEventDto);
    }

    @Get('shop/:shopSlug')
    async getAllEvents(
        @Param('shopSlug') shopSlug: string,
        @Query('regionName') regionName: string | any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('filter') filter?: 'upcoming' | 'latest' | 'past', // Optional filter for event type
        @Query('startDate') startDate?: string, // Optional filter for start date
        @Query('endDate') endDate?: string, // Optional filter for end date
        @Query('location') location?: string // Optional filter for location
    ): Promise<{ data: Event[], total: number, page: number, limit: number }> {
        return this.eventService.getAllEvents(shopSlug, regionName, page, limit, filter, startDate, endDate, location);
    }

    @Get(':id')
    getEventById(@Param('id') id: number): Promise<Event> {
        return this.eventService.getEventById(id);
    }

    @Put(':id')
    async updateEvent(@Param('id') id: number, @Body() updateEventDto: UpdateEventDto): Promise<Event> {
        await this.cacheService.invalidateCacheBySubstring("events")
        return this.eventService.updateEvent(id, updateEventDto);
    }

    @Delete(':id')
    async deleteEvent(@Param('id') id: number): Promise<void> {
        await this.cacheService.invalidateCacheBySubstring("events")
        return this.eventService.deleteEvent(id);
    }
}

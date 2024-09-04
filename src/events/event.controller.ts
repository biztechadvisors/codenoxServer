import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post()
    createEvent(@Body() createEventDto: CreateEventDto): Promise<Event> {
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
    updateEvent(@Param('id') id: number, @Body() updateEventDto: UpdateEventDto): Promise<Event> {
        return this.eventService.updateEvent(id, updateEventDto);
    }

    @Delete(':id')
    deleteEvent(@Param('id') id: number): Promise<void> {
        return this.eventService.deleteEvent(id);
    }
}

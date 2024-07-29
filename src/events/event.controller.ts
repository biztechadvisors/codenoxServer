import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
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
    getAllEvents(@Param('shopSlug') shopSlug: string): Promise<Event[]> {
        return this.eventService.getAllEvents(shopSlug);
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

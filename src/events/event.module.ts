import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Event, Attachment, Shop])],
    providers: [EventService],
    controllers: [EventController],
})
export class EventModule { }

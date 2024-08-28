import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerService } from './career.service';
import { CareerController } from './career.controller';
import { Career } from './entities/career.entity';
import { Shop } from '../shops/entities/shop.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Career, Shop])],
    providers: [CareerService],
    controllers: [CareerController],
})
export class CareerModule { }

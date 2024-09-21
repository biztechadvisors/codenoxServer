import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerService } from './career.service';
import { CareerController, VacancyController } from './career.controller';
import { Career } from './entities/career.entity';
import { Shop } from '../shops/entities/shop.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { Vacancy } from './entities/vacancies.entity';
import { Add } from '../address/entities/address.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Career, Shop, Vacancy, Add]),
    CacheModule.register(),
    ],
    providers: [CareerService],
    controllers: [CareerController, VacancyController],
})
export class CareerModule { }

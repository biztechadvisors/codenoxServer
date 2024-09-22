import { Repository } from 'typeorm';
import { Career } from './entities/career.entity';
import { CreateCareerDto, UpdateCareerDto } from './dto/createcareer.dto';
import { Shop } from '../shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { Vacancy } from './entities/vacancies.entity';
import { CreateVacancyDto, UpdateVacancyDto } from './dto/createvacancy.dto';
import { Add } from '../address/entities/address.entity';
export declare class CareerService {
    private readonly careerRepository;
    private readonly vacancyRepository;
    private readonly shopRepository;
    private readonly addressRepository;
    private readonly cacheManager;
    constructor(careerRepository: Repository<Career>, vacancyRepository: Repository<Vacancy>, shopRepository: Repository<Shop>, addressRepository: Repository<Add>, cacheManager: Cache);
    createCareer(createCareerDto: CreateCareerDto): Promise<Career>;
    updateCareer(id: number, updateCareerDto: UpdateCareerDto): Promise<Career>;
    getCareerById(id: number): Promise<Career>;
    findAllByShop(shopSlug: string, location?: string, vacancyTitle?: string, position?: string, page?: number, limit?: number): Promise<{
        data: Career[];
        count: number;
    }>;
    deleteCareer(id: number): Promise<void>;
    createVacancy(createVacancyDto: CreateVacancyDto): Promise<Vacancy>;
    updateVacancy(id: number, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy>;
    findVacancyById(id: number): Promise<Vacancy>;
    deleteVacancy(id: number): Promise<void>;
    findAllVacancies(page: number, limit: number, city?: string): Promise<{
        data: Vacancy[];
        count: number;
    }>;
}

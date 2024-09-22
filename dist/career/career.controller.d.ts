import { CareerService } from './career.service';
import { CreateCareerDto, UpdateCareerDto } from './dto/createcareer.dto';
import { Career } from './entities/career.entity';
import { Vacancy } from './entities/vacancies.entity';
import { CreateVacancyDto, FindVacanciesDto, UpdateVacancyDto } from './dto/createvacancy.dto';
export declare class CareerController {
    private readonly careerService;
    constructor(careerService: CareerService);
    create(createCareerDto: CreateCareerDto): Promise<Career>;
    findAllByShop(shopSlug: string, location?: string, vacancyTitle?: string, position?: string, page?: number, limit?: number): Promise<{
        data: Career[];
        count: number;
    }>;
    findOne(id: number): Promise<Career>;
    update(id: number, updateCareerDto: UpdateCareerDto): Promise<Career>;
    remove(id: number): Promise<void>;
}
export declare class VacancyController {
    private readonly careerService;
    constructor(careerService: CareerService);
    create(createVacancyDto: CreateVacancyDto): Promise<Vacancy>;
    findOne(id: number): Promise<Vacancy>;
    update(id: number, updateVacancyDto: UpdateVacancyDto): Promise<Vacancy>;
    remove(id: number): Promise<void>;
    findAll(findVacanciesDto: FindVacanciesDto): Promise<{
        data: Vacancy[];
        count: number;
    }>;
}

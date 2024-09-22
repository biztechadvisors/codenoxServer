import { Shop } from '@db/src/shops/entities/shop.entity';
import { Vacancy } from './vacancies.entity';
import { CoreEntity } from '@db/src/common/entities/core.entity';
export declare class Career extends CoreEntity {
    id: number;
    fullName: string;
    phone: string;
    email: string;
    position: string;
    location: string;
    cv_resume?: string;
    shop: Shop;
    vacancy: Vacancy;
}

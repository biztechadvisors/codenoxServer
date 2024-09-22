import { Add } from '@db/src/address/entities/address.entity';
import { Shop } from '@db/src/shops/entities/shop.entity';
import { Career } from './career.entity';
import { CoreEntity } from '@db/src/common/entities/core.entity';
export declare class Vacancy extends CoreEntity {
    id: number;
    title: string;
    description: string;
    employmentType: string;
    salaryRange: string;
    location: Add;
    shop: Shop;
    career: Career[];
}

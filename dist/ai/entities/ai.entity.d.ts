import { CoreEntity } from 'src/common/entities/core.entity';
export declare class Ai extends CoreEntity {
    id: number;
    status: 'success' | 'failed';
    result: string;
}

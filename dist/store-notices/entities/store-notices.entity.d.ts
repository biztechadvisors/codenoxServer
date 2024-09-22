import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
declare enum StoreNoticePriorityType {
    High = "high",
    Medium = "medium",
    Low = "low"
}
export declare class StoreNotice extends CoreEntity {
    id: number;
    priority: StoreNoticePriorityType;
    notice: string;
    description?: string;
    effective_from?: string;
    expired_at: string;
    type?: string;
    is_read?: boolean;
    shops?: Shop[];
    users?: User[];
    received_by?: string;
    created_by: string;
    expire_at: string;
    deleted_at?: string;
    translated_languages: string[];
    creator?: string;
}
export {};

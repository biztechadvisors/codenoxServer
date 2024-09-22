import { GetStoreNoticesDto } from './dto/get-store-notices.dto';
import { StoreNotice } from './entities/store-notices.entity';
import { CreateStoreNoticeDto } from './dto/create-store-notice.dto';
import { UpdateStoreNoticeDto } from './dto/update-store-notice.dto';
export declare class StoreNoticesService {
    create(createStoreNoticeDto: CreateStoreNoticeDto): any[];
    getStoreNotices({ search, limit, page }: GetStoreNoticesDto): {
        count: number;
        current_page: number;
        firstItem: number;
        lastItem: number;
        last_page: number;
        per_page: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
        next_page_url: string;
        prev_page_url: string;
        data: StoreNotice[];
    };
    getStoreNotice(param: string, language: string): any[];
    update(id: number, updateStoreNoticeDto: UpdateStoreNoticeDto): any[];
    remove(id: number): string;
}

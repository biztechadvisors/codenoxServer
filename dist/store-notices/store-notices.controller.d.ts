import { UsersService } from 'src/users/users.service';
import { CreateStoreNoticeDto } from './dto/create-store-notice.dto';
import { GetStoreNoticesDto } from './dto/get-store-notices.dto';
import { UpdateStoreNoticeDto } from './dto/update-store-notice.dto';
import { StoreNoticesService } from './store-notices.service';
export declare class StoreNoticesController {
    private readonly storeNoticesService;
    private readonly usersService;
    constructor(storeNoticesService: StoreNoticesService, usersService: UsersService);
    createStoreNotice(createStoreNoticeDto: CreateStoreNoticeDto): any[];
    getStoreNotices(query: GetStoreNoticesDto): {
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
        data: import("./entities/store-notices.entity").StoreNotice[];
    };
    getStoreNotice(param: string, language: string): any[];
    update(id: string, updateStoreNoticeDto: UpdateStoreNoticeDto): any[];
    deleteStoreNotice(id: string): string;
}

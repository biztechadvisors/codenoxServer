import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { CouponType } from '../entities/coupon.entity';
export declare class CreateCouponDto {
    code: string;
    description?: string;
    minimum_cart_amount: number;
    translated_languages: string | string[];
    active_from: string;
    expire_at: string;
    language: string;
    type: CouponType;
    is_valid: boolean;
    amount: number;
    image: AttachmentDTO;
}
export declare class pagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    totalResults: number;
    url: string;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
}

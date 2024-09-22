import { CreateCouponDto, pagination } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { GetCouponsDto } from './dto/get-coupons.dto';
import { Repository } from 'typeorm';
import { Attachment } from 'src/common/entities/attachment.entity';
export declare class CouponsService {
    private readonly couponRepository;
    private readonly attachmentRepository;
    constructor(couponRepository: Repository<Coupon>, attachmentRepository: Repository<Attachment>);
    create(createCouponDto: CreateCouponDto): Promise<Coupon>;
    getCoupons({ search, limit, page }: GetCouponsDto): Promise<{
        data: Coupon[];
        pagination: pagination;
    }>;
    getCoupon(param: string): Promise<Coupon[]>;
    update(id: number, updateCouponDto: UpdateCouponDto): Promise<Coupon>;
    remove(id: number): Promise<void>;
    verifyCoupon(code: string): Promise<Coupon | null>;
}

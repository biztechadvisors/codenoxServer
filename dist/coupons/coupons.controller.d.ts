import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { GetCouponsDto } from './dto/get-coupons.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { VerifyCouponInput } from './dto/verify-coupon.dto';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    createCoupon(createCouponDto: CreateCouponDto): Promise<import("./entities/coupon.entity").Coupon>;
    getCoupons(query: GetCouponsDto): Promise<{
        data: import("./entities/coupon.entity").Coupon[];
        pagination: import("./dto/create-coupon.dto").pagination;
    }>;
    getCoupon(param: string): Promise<import("./entities/coupon.entity").Coupon[]>;
    verifyCoupon(input: VerifyCouponInput): Promise<{
        message: string;
        coupon: import("./entities/coupon.entity").Coupon;
    } | {
        message: string;
        coupon?: undefined;
    }>;
    updateCoupon(id: string, updateCouponDto: UpdateCouponDto): Promise<import("./entities/coupon.entity").Coupon>;
    deleteCoupon(id: string): Promise<void>;
}

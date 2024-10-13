"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const coupon_entity_1 = require("./entities/coupon.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attachment_entity_1 = require("../common/entities/attachment.entity");
let CouponsService = class CouponsService {
    constructor(couponRepository, attachmentRepository) {
        this.couponRepository = couponRepository;
        this.attachmentRepository = attachmentRepository;
    }
    async create(createCouponDto) {
        const coupon = new coupon_entity_1.Coupon();
        coupon.code = createCouponDto.code;
        coupon.language = createCouponDto.language;
        coupon.description = createCouponDto.description;
        coupon.minimum_cart_amount = createCouponDto.minimum_cart_amount;
        coupon.is_valid = createCouponDto.is_valid;
        coupon.amount = createCouponDto.amount;
        coupon.active_from = createCouponDto.active_from;
        coupon.expire_at = createCouponDto.expire_at;
        const Type = createCouponDto.type ? createCouponDto.type : coupon_entity_1.CouponType.DEFAULT_COUPON;
        switch (Type) {
            case coupon_entity_1.CouponType.FIXED_COUPON:
                coupon.type = coupon_entity_1.CouponType.FIXED_COUPON;
                break;
            case coupon_entity_1.CouponType.FREE_SHIPPING_COUPON:
                coupon.type = coupon_entity_1.CouponType.FREE_SHIPPING_COUPON;
                break;
            case coupon_entity_1.CouponType.PERCENTAGE_COUPON:
                coupon.type = coupon_entity_1.CouponType.PERCENTAGE_COUPON;
                break;
            default:
                coupon.type = coupon_entity_1.CouponType.DEFAULT_COUPON;
                break;
        }
        coupon.type = Type;
        if (Array.isArray(createCouponDto.translated_languages) && createCouponDto.translated_languages.length > 0) {
            coupon.translated_languages = createCouponDto.translated_languages;
        }
        else if (typeof createCouponDto.translated_languages === 'string') {
            coupon.translated_languages = [createCouponDto.translated_languages];
        }
        const saveCoupon = await this.couponRepository.save(coupon);
        return saveCoupon;
    }
    async getCoupons({ search, limit, page }) {
        if (!page)
            page = 1;
        if (!limit)
            limit = 12;
        const startIndex = (page - 1) * limit;
        let queryBuilder = this.couponRepository.createQueryBuilder('coupon');
        if (search) {
            const parseSearchParams = search.split(';');
            for (const searchParam of parseSearchParams) {
                const [key, value] = searchParam.split(':');
                if (key !== 'slug') {
                    queryBuilder = queryBuilder.andWhere(`coupon.${key} = :value`, { value });
                }
            }
        }
        const [coupons, totalCount] = await queryBuilder
            .skip(startIndex)
            .take(limit)
            .getManyAndCount();
        const queryParams = [
            search ? `search=${encodeURIComponent(search)}` : '',
            limit ? `limit=${limit}` : ''
        ]
            .filter(Boolean)
            .join('&');
        const url = `/coupons?${queryParams}`;
        const pagination = paginate(totalCount, page, limit, coupons.length, url);
        return {
            data: coupons,
            pagination,
        };
    }
    async getCoupon(param) {
        const findAddress = await this.couponRepository.find({ where: { code: param } });
        return findAddress;
    }
    async update(id, updateCouponDto) {
        const existingCoupons = await this.couponRepository.findOne({
            where: { id },
        });
        if (!existingCoupons) {
            throw new common_1.NotFoundException('Address not found');
        }
        existingCoupons.code = updateCouponDto.code;
        existingCoupons.language = updateCouponDto.language;
        existingCoupons.description = updateCouponDto.description;
        existingCoupons.minimum_cart_amount = updateCouponDto.minimum_cart_amount;
        const Type = updateCouponDto.type ? updateCouponDto.type : coupon_entity_1.CouponType.DEFAULT_COUPON;
        switch (Type) {
            case coupon_entity_1.CouponType.FIXED_COUPON:
                existingCoupons.type = coupon_entity_1.CouponType.FIXED_COUPON;
                break;
            case coupon_entity_1.CouponType.FREE_SHIPPING_COUPON:
                existingCoupons.type = coupon_entity_1.CouponType.FREE_SHIPPING_COUPON;
                break;
            case coupon_entity_1.CouponType.PERCENTAGE_COUPON:
                existingCoupons.type = coupon_entity_1.CouponType.PERCENTAGE_COUPON;
                break;
            default:
                existingCoupons.type = coupon_entity_1.CouponType.DEFAULT_COUPON;
                break;
        }
        existingCoupons.type = Type;
        if (Array.isArray(updateCouponDto.translated_languages) && updateCouponDto.translated_languages.length > 0) {
            existingCoupons.translated_languages = updateCouponDto.translated_languages;
        }
        else if (typeof updateCouponDto.translated_languages === 'string') {
            existingCoupons.translated_languages = [updateCouponDto.translated_languages];
        }
        const UpdateCoupon = await this.couponRepository.save(existingCoupons);
        return UpdateCoupon;
    }
    async remove(id) {
        const existingCoupons = await this.couponRepository.findOne({ where: { id } });
        if (!existingCoupons) {
            throw new common_1.NotFoundException('Address not found');
        }
        await this.couponRepository.remove(existingCoupons);
    }
    async verifyCoupon(code) {
        const currentDate = new Date();
        const coupon = await this.couponRepository.findOne({ where: { code: code } });
        if (coupon && coupon.expire_at) {
            const expirationDate = new Date(coupon.expire_at);
            if (expirationDate > currentDate) {
                return coupon;
            }
            else {
                return null;
            }
        }
        return null;
    }
};
CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __param(1, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CouponsService);
exports.CouponsService = CouponsService;
function paginate(totalItems, currentPage, pageSize, totalResults, url) {
    const totalPages = Math.ceil(totalItems / pageSize);
    return {
        currentPage,
        pageSize,
        totalItems,
        totalPages,
        totalResults,
        url,
        first_page_url: `${url}&page=1`,
        last_page_url: `${url}&page=${totalPages}`,
        next_page_url: currentPage < totalPages ? `${url}&page=${currentPage + 1}` : null,
        prev_page_url: currentPage > 1 ? `${url}&page=${currentPage - 1}` : null,
    };
}
//# sourceMappingURL=coupons.service.js.map
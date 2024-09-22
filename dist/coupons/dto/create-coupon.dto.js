"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagination = exports.CreateCouponDto = void 0;
const openapi = require("@nestjs/swagger");
class CreateCouponDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { code: { required: true, type: () => String }, description: { required: false, type: () => String }, minimum_cart_amount: { required: true, type: () => Number }, translated_languages: { required: true, type: () => Object }, active_from: { required: true, type: () => String }, expire_at: { required: true, type: () => String }, language: { required: true, type: () => String }, type: { required: true, enum: require("../entities/coupon.entity").CouponType }, is_valid: { required: true, type: () => Boolean }, amount: { required: true, type: () => Number }, image: { required: true, type: () => require("../../common/dto/attachment.dto").AttachmentDTO } };
    }
}
exports.CreateCouponDto = CreateCouponDto;
class pagination {
    static _OPENAPI_METADATA_FACTORY() {
        return { currentPage: { required: true, type: () => Number }, pageSize: { required: true, type: () => Number }, totalItems: { required: true, type: () => Number }, totalPages: { required: true, type: () => Number }, totalResults: { required: true, type: () => Number }, url: { required: true, type: () => String }, first_page_url: { required: true, type: () => String }, last_page_url: { required: true, type: () => String }, next_page_url: { required: true, type: () => String, nullable: true }, prev_page_url: { required: true, type: () => String, nullable: true } };
    }
}
exports.pagination = pagination;
//# sourceMappingURL=create-coupon.dto.js.map
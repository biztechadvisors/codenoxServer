"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveShopDto = exports.CreateShopDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const shop_entity_1 = require("../entities/shop.entity");
class CreateShopDto extends (0, swagger_1.PickType)(shop_entity_1.Shop, [
    'name',
    'slug',
    'address',
    'description',
    'logo',
    'settings',
    'balance',
    'owner',
    'dealerCount',
]) {
    static _OPENAPI_METADATA_FACTORY() {
        return { categories: { required: true, type: () => [Number] }, permission: { required: true, type: () => require("../../permission/entities/permission.entity").Permission }, additionalPermissions: { required: true, type: () => [require("../../permission/entities/permission.entity").Permission] }, cover_image: { required: true, type: () => [require("../../common/entities/attachment.entity").Attachment] }, user: { required: true, type: () => require("../../users/entities/user.entity").User } };
    }
}
exports.CreateShopDto = CreateShopDto;
class ApproveShopDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, admin_commission_rate: { required: true, type: () => Number } };
    }
}
exports.ApproveShopDto = ApproveShopDto;
//# sourceMappingURL=create-shop.dto.js.map
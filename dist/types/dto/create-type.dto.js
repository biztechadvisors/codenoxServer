"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTypeDto = exports.TypeSettingsDto = exports.BannerDto = void 0;
const openapi = require("@nestjs/swagger");
class BannerDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, title: { required: false, type: () => String }, description: { required: false, type: () => String }, image: { required: true, type: () => require("../../common/dto/attachment.dto").AttachmentDTO } };
    }
}
exports.BannerDto = BannerDto;
class TypeSettingsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { isHome: { required: true, type: () => Boolean }, productCard: { required: true, type: () => String }, layoutType: { required: true, type: () => String } };
    }
}
exports.TypeSettingsDto = TypeSettingsDto;
class CreateTypeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { language: { required: true, type: () => String }, name: { required: true, type: () => String }, shop_id: { required: true, type: () => Number }, icon: { required: true, type: () => String }, slug: { required: true, type: () => String }, settings: { required: true, type: () => require("./create-type.dto").TypeSettingsDto }, promotional_sliders: { required: true, type: () => [require("../../common/dto/attachment.dto").AttachmentDTO] }, banners: { required: true, type: () => [require("./create-type.dto").BannerDto] }, translated_languages: { required: true, type: () => [String] }, region_name: { required: true, type: () => [String] } };
    }
}
exports.CreateTypeDto = CreateTypeDto;
//# sourceMappingURL=create-type.dto.js.map
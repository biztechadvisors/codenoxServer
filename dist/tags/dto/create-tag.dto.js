"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTagDto = void 0;
const openapi = require("@nestjs/swagger");
class CreateTagDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, icon: { required: true, type: () => String }, details: { required: true, type: () => String }, language: { required: true, type: () => String }, translatedLanguages: { required: true, type: () => [String] }, shopSlug: { required: true, type: () => String }, image: { required: false, type: () => ({ id: { required: true, type: () => Number } }) }, type_id: { required: false, type: () => Number }, parent: { required: false, type: () => Number }, region_name: { required: true, type: () => [String] } };
    }
}
exports.CreateTagDto = CreateTagDto;
//# sourceMappingURL=create-tag.dto.js.map
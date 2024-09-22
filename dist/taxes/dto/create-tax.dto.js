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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateGstDto = exports.CreateTaxDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const tax_entity_1 = require("../entities/tax.entity");
const class_validator_1 = require("class-validator");
class CreateTaxDto extends (0, swagger_1.OmitType)(tax_entity_1.Tax, [
    'id',
    'created_at',
    'updated_at',
]) {
    static _OPENAPI_METADATA_FACTORY() {
        return { shop_id: { required: true, type: () => Number } };
    }
}
exports.CreateTaxDto = CreateTaxDto;
class ValidateGstDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { gstNumber: { required: true, type: () => String } };
    }
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateGstDto.prototype, "gstNumber", void 0);
exports.ValidateGstDto = ValidateGstDto;
//# sourceMappingURL=create-tax.dto.js.map
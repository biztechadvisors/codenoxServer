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
exports.UpdateQnADto = exports.CreateQnADto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const qna_entity_1 = require("../entities/qna.entity");
class CreateQnADto {
    static _OPENAPI_METADATA_FACTORY() {
        return { question: { required: true, type: () => String }, answer: { required: false, type: () => String }, type: { required: false, enum: require("../entities/qna.entity").QnAType } };
    }
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQnADto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQnADto.prototype, "answer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(qna_entity_1.QnAType),
    __metadata("design:type", String)
], CreateQnADto.prototype, "type", void 0);
exports.CreateQnADto = CreateQnADto;
class UpdateQnADto {
    static _OPENAPI_METADATA_FACTORY() {
        return { question: { required: false, type: () => String }, answer: { required: false, type: () => String }, type: { required: false, enum: require("../entities/qna.entity").QnAType } };
    }
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQnADto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateQnADto.prototype, "answer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(qna_entity_1.QnAType),
    __metadata("design:type", String)
], UpdateQnADto.prototype, "type", void 0);
exports.UpdateQnADto = UpdateQnADto;
//# sourceMappingURL=createqnadto.dto.js.map
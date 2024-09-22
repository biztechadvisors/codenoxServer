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
exports.Career = void 0;
const openapi = require("@nestjs/swagger");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const typeorm_1 = require("typeorm");
const vacancies_entity_1 = require("./vacancies.entity");
const core_entity_1 = require("../../common/entities/core.entity");
let Career = class Career extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, fullName: { required: true, type: () => String }, phone: { required: true, type: () => String }, email: { required: true, type: () => String }, position: { required: true, type: () => String }, location: { required: true, type: () => String }, cv_resume: { required: false, type: () => String }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, vacancy: { required: true, type: () => require("./vacancies.entity").Vacancy } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Career.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Career.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Career.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Career.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Career.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Career.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Career.prototype, "cv_resume", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, { onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: 'shop_id' }),
    __metadata("design:type", shop_entity_1.Shop)
], Career.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vacancies_entity_1.Vacancy, vacancy => vacancy.career, { onUpdate: 'CASCADE' }),
    __metadata("design:type", vacancies_entity_1.Vacancy)
], Career.prototype, "vacancy", void 0);
Career = __decorate([
    (0, typeorm_1.Entity)()
], Career);
exports.Career = Career;
//# sourceMappingURL=career.entity.js.map
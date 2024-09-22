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
exports.Vacancy = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const address_entity_1 = require("../../address/entities/address.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const career_entity_1 = require("./career.entity");
const core_entity_1 = require("../../common/entities/core.entity");
let Vacancy = class Vacancy extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, title: { required: true, type: () => String }, description: { required: true, type: () => String }, employmentType: { required: true, type: () => String }, salaryRange: { required: true, type: () => String }, location: { required: true, type: () => require("../../address/entities/address.entity").Add }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, career: { required: true, type: () => [require("./career.entity").Career] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Vacancy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Vacancy.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Vacancy.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Vacancy.prototype, "employmentType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Vacancy.prototype, "salaryRange", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => address_entity_1.Add, { eager: true, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: 'address_id' }),
    __metadata("design:type", address_entity_1.Add)
], Vacancy.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: 'shop_id' }),
    __metadata("design:type", shop_entity_1.Shop)
], Vacancy.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => career_entity_1.Career, career => career.vacancy, { cascade: true }),
    __metadata("design:type", Array)
], Vacancy.prototype, "career", void 0);
Vacancy = __decorate([
    (0, typeorm_1.Entity)()
], Vacancy);
exports.Vacancy = Vacancy;
//# sourceMappingURL=vacancies.entity.js.map
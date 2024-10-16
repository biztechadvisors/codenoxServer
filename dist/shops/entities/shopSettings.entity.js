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
exports.ShopSettings = void 0;
const openapi = require("@nestjs/swagger");
const setting_entity_1 = require("../../settings/entities/setting.entity");
const typeorm_1 = require("typeorm");
let ShopSettings = class ShopSettings {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, socials: { required: true, type: () => [require("../../settings/entities/setting.entity").ShopSocials] }, contact: { required: true, type: () => String }, location: { required: true, type: () => require("../../settings/entities/setting.entity").Location }, website: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ShopSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => setting_entity_1.ShopSocials, { onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinTable)({ name: "shopSettings_shopSocials" }),
    __metadata("design:type", Array)
], ShopSettings.prototype, "socials", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ShopSettings.prototype, "contact", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => setting_entity_1.Location, { onDelete: "CASCADE", nullable: true }),
    __metadata("design:type", setting_entity_1.Location)
], ShopSettings.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ShopSettings.prototype, "website", void 0);
ShopSettings = __decorate([
    (0, typeorm_1.Entity)()
], ShopSettings);
exports.ShopSettings = ShopSettings;
//# sourceMappingURL=shopSettings.entity.js.map
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
exports.StoreNotice = void 0;
const openapi = require("@nestjs/swagger");
const core_entity_1 = require("../../common/entities/core.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
var StoreNoticePriorityType;
(function (StoreNoticePriorityType) {
    StoreNoticePriorityType["High"] = "high";
    StoreNoticePriorityType["Medium"] = "medium";
    StoreNoticePriorityType["Low"] = "low";
})(StoreNoticePriorityType || (StoreNoticePriorityType = {}));
let StoreNotice = class StoreNotice extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, priority: { required: true, enum: StoreNoticePriorityType }, notice: { required: true, type: () => String }, description: { required: false, type: () => String }, effective_from: { required: false, type: () => String }, expired_at: { required: true, type: () => String }, type: { required: false, type: () => String }, is_read: { required: false, type: () => Boolean }, shops: { required: false, type: () => [require("../../shops/entities/shop.entity").Shop] }, users: { required: false, type: () => [require("../../users/entities/user.entity").User] }, received_by: { required: false, type: () => String }, created_by: { required: true, type: () => String }, expire_at: { required: true, type: () => String }, deleted_at: { required: false, type: () => String }, translated_languages: { required: true, type: () => [String] }, creator: { required: false, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StoreNotice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoreNotice.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoreNotice.prototype, "notice", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoreNotice.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoreNotice.prototype, "effective_from", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoreNotice.prototype, "expired_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoreNotice.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], StoreNotice.prototype, "is_read", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => shop_entity_1.Shop),
    (0, typeorm_1.JoinTable)({ name: "storeNotice_shops" }),
    __metadata("design:type", Array)
], StoreNotice.prototype, "shops", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User),
    (0, typeorm_1.JoinTable)({ name: "storeNotice_users" }),
    __metadata("design:type", Array)
], StoreNotice.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoreNotice.prototype, "received_by", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoreNotice.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoreNotice.prototype, "expire_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoreNotice.prototype, "deleted_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], StoreNotice.prototype, "translated_languages", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], StoreNotice.prototype, "creator", void 0);
StoreNotice = __decorate([
    (0, typeorm_1.Entity)()
], StoreNotice);
exports.StoreNotice = StoreNotice;
//# sourceMappingURL=store-notices.entity.js.map
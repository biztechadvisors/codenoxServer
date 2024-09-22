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
exports.GetInspired = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
const tag_entity_1 = require("../../tags/entities/tag.entity");
let GetInspired = class GetInspired {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, title: { required: true, type: () => String }, type: { required: true, type: () => String }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, images: { required: true, type: () => [require("../../common/entities/attachment.entity").Attachment] }, tags: { required: false, type: () => [require("../../tags/entities/tag.entity").Tag] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GetInspired.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GetInspired.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GetInspired.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop),
    __metadata("design:type", shop_entity_1.Shop)
], GetInspired.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => attachment_entity_1.Attachment, { cascade: true, eager: true }),
    (0, typeorm_1.JoinTable)({
        name: 'get_inspired_images',
        joinColumn: { name: 'getInspiredId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], GetInspired.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => tag_entity_1.Tag, { cascade: true, eager: true }),
    (0, typeorm_1.JoinTable)({
        name: 'get_inspired_tags',
        joinColumn: { name: 'get_inspiredId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], GetInspired.prototype, "tags", void 0);
GetInspired = __decorate([
    (0, typeorm_1.Entity)()
], GetInspired);
exports.GetInspired = GetInspired;
//# sourceMappingURL=get-inspired.entity.js.map
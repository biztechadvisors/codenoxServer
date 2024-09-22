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
exports.FAQ = void 0;
const openapi = require("@nestjs/swagger");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const typeorm_1 = require("typeorm");
const qna_entity_1 = require("./qna.entity");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
let FAQ = class FAQ {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, title: { required: true, type: () => String }, description: { required: true, type: () => String }, images: { required: false, type: () => [require("../../common/entities/attachment.entity").Attachment] }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, qnas: { required: true, type: () => [require("./qna.entity").QnA] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FAQ.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FAQ.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FAQ.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => attachment_entity_1.Attachment, { eager: true }),
    (0, typeorm_1.JoinTable)({
        name: 'faq_images',
        joinColumn: { name: 'faqId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], FAQ.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop),
    __metadata("design:type", shop_entity_1.Shop)
], FAQ.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => qna_entity_1.QnA, qna => qna.faq, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], FAQ.prototype, "qnas", void 0);
FAQ = __decorate([
    (0, typeorm_1.Entity)()
], FAQ);
exports.FAQ = FAQ;
//# sourceMappingURL=faq.entity.js.map
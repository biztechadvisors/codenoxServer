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
exports.Review = void 0;
const openapi = require("@nestjs/swagger");
const core_entity_1 = require("../../common/entities/core.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
const reports_entity_1 = require("./reports.entity");
const feedback_entity_1 = require("../../feedbacks/entities/feedback.entity");
const typeorm_1 = require("typeorm");
let Review = class Review extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, rating: { required: true, type: () => Number }, name: { required: true, type: () => String }, comment: { required: true, type: () => String }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, order: { required: true, type: () => require("../../orders/entities/order.entity").Order }, photos: { required: true, type: () => [require("../../common/entities/attachment.entity").Attachment] }, user: { required: true, type: () => require("../../users/entities/user.entity").User }, product: { required: true, type: () => require("../../products/entities/product.entity").Product }, feedbacks: { required: true, type: () => [require("../../feedbacks/entities/feedback.entity").Feedback] }, my_feedback: { required: true, type: () => require("../../feedbacks/entities/feedback.entity").Feedback }, positive_feedbacks_count: { required: true, type: () => Number }, negative_feedbacks_count: { required: true, type: () => Number }, abusive_reports: { required: true, type: () => [require("./reports.entity").Report] }, variation_option_id: { required: false, type: () => String }, abusive_reports_count: { required: false, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Review.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Review.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'shop_id' }),
    __metadata("design:type", shop_entity_1.Shop)
], Review.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", order_entity_1.Order)
], Review.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => attachment_entity_1.Attachment, { cascade: true, eager: true }),
    (0, typeorm_1.JoinTable)({ name: 'review_attachment' }),
    __metadata("design:type", Array)
], Review.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Review.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, product => product.my_review, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], Review.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => feedback_entity_1.Feedback),
    (0, typeorm_1.JoinTable)({ name: 'review_feedback' }),
    __metadata("design:type", Array)
], Review.prototype, "feedbacks", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => feedback_entity_1.Feedback, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'my_feedback_id' }),
    __metadata("design:type", feedback_entity_1.Feedback)
], Review.prototype, "my_feedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Review.prototype, "positive_feedbacks_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Review.prototype, "negative_feedbacks_count", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => reports_entity_1.Report),
    (0, typeorm_1.JoinTable)({ name: 'review_report' }),
    __metadata("design:type", Array)
], Review.prototype, "abusive_reports", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Review.prototype, "variation_option_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Review.prototype, "abusive_reports_count", void 0);
Review = __decorate([
    (0, typeorm_1.Entity)()
], Review);
exports.Review = Review;
//# sourceMappingURL=review.entity.js.map
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
exports.Question = void 0;
const openapi = require("@nestjs/swagger");
const core_entity_1 = require("../../common/entities/core.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const feedback_entity_1 = require("../../feedbacks/entities/feedback.entity");
const typeorm_1 = require("typeorm");
let Question = class Question extends core_entity_1.CoreEntity {
    constructor() {
        super(...arguments);
        this.positive_feedbacks_count = 0;
        this.negative_feedbacks_count = 0;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, question: { required: false, type: () => String }, answer: { required: false, type: () => String }, positive_feedbacks_count: { required: true, type: () => Number, default: 0 }, negative_feedbacks_count: { required: true, type: () => Number, default: 0 }, product: { required: true, type: () => require("../../products/entities/product.entity").Product }, shop_id: { required: true, type: () => Number }, user: { required: true, type: () => require("../../users/entities/user.entity").User }, feedbacks: { required: false, type: () => [require("../../feedbacks/entities/feedback.entity").Feedback] }, my_feedback: { required: false, type: () => require("../../feedbacks/entities/feedback.entity").Feedback } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Question.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Question.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Question.prototype, "answer", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Question.prototype, "positive_feedbacks_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Question.prototype, "negative_feedbacks_count", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], Question.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Question.prototype, "shop_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Question.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => feedback_entity_1.Feedback, { cascade: true }),
    (0, typeorm_1.JoinTable)({ name: "question_feedback" }),
    __metadata("design:type", Array)
], Question.prototype, "feedbacks", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => feedback_entity_1.Feedback, { cascade: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'my_feedback_id' }),
    __metadata("design:type", feedback_entity_1.Feedback)
], Question.prototype, "my_feedback", void 0);
Question = __decorate([
    (0, typeorm_1.Entity)()
], Question);
exports.Question = Question;
//# sourceMappingURL=question.entity.js.map
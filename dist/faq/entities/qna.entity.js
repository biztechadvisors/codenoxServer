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
exports.QnA = exports.QnAType = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const faq_entity_1 = require("./faq.entity");
var QnAType;
(function (QnAType) {
    QnAType["GENERAL_QUESTION"] = "GENERAL_QUESTION";
    QnAType["SHIPPING_PRODUCTS_INSTALLATION"] = "SHIPPING_PRODUCTS_INSTALLATION";
})(QnAType = exports.QnAType || (exports.QnAType = {}));
let QnA = class QnA {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, question: { required: true, type: () => String }, answer: { required: true, type: () => String }, type: { required: true, enum: require("./qna.entity").QnAType }, faq: { required: true, type: () => require("./faq.entity").FAQ } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], QnA.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], QnA.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
    }),
    __metadata("design:type", String)
], QnA.prototype, "answer", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: QnAType,
        default: QnAType.GENERAL_QUESTION
    }),
    __metadata("design:type", String)
], QnA.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => faq_entity_1.FAQ, faq => faq.qnas),
    __metadata("design:type", faq_entity_1.FAQ)
], QnA.prototype, "faq", void 0);
QnA = __decorate([
    (0, typeorm_1.Entity)()
], QnA);
exports.QnA = QnA;
//# sourceMappingURL=qna.entity.js.map
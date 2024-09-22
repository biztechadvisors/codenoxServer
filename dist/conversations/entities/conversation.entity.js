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
exports.Conversation = exports.LatestMessage = void 0;
const openapi = require("@nestjs/swagger");
const core_entity_1 = require("../../common/entities/core.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
let LatestMessage = class LatestMessage extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, body: { required: true, type: () => String }, conversation_id: { required: true, type: () => Number }, user_id: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LatestMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LatestMessage.prototype, "body", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LatestMessage.prototype, "conversation_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LatestMessage.prototype, "user_id", void 0);
LatestMessage = __decorate([
    (0, typeorm_1.Entity)()
], LatestMessage);
exports.LatestMessage = LatestMessage;
let Conversation = class Conversation extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, shop_id: { required: true, type: () => Number }, unseen: { required: true, type: () => Boolean }, user_id: { required: true, type: () => String }, user: { required: true, type: () => require("../../users/entities/user.entity").User }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, latest_message: { required: true, type: () => require("./conversation.entity").LatestMessage } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Conversation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Conversation.prototype, "shop_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Conversation.prototype, "unseen", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Conversation.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], Conversation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop),
    __metadata("design:type", shop_entity_1.Shop)
], Conversation.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => LatestMessage),
    __metadata("design:type", LatestMessage)
], Conversation.prototype, "latest_message", void 0);
Conversation = __decorate([
    (0, typeorm_1.Entity)()
], Conversation);
exports.Conversation = Conversation;
//# sourceMappingURL=conversation.entity.js.map
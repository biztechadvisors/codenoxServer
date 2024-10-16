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
exports.Add = exports.UserAdd = exports.AddressType = void 0;
const openapi = require("@nestjs/swagger");
const core_entity_1 = require("../../common/entities/core.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
var AddressType;
(function (AddressType) {
    AddressType["BILLING"] = "billing";
    AddressType["SHIPPING"] = "shipping";
    AddressType["SHOP"] = "shop";
})(AddressType = exports.AddressType || (exports.AddressType = {}));
let UserAdd = class UserAdd extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, street_address: { required: true, type: () => String }, country: { required: true, type: () => String }, city: { required: true, type: () => String }, state: { required: true, type: () => String }, zip: { required: true, type: () => String }, customer_id: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserAdd.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserAdd.prototype, "street_address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserAdd.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserAdd.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserAdd.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserAdd.prototype, "zip", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], UserAdd.prototype, "customer_id", void 0);
UserAdd = __decorate([
    (0, typeorm_1.Entity)()
], UserAdd);
exports.UserAdd = UserAdd;
let Add = class Add {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, title: { required: true, type: () => String }, type: { required: true, enum: require("./address.entity").AddressType }, default: { required: true, type: () => Boolean }, customer: { required: true, type: () => require("../../users/entities/user.entity").User }, address: { required: true, type: () => require("./address.entity").UserAdd } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Add.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Add.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AddressType,
        default: AddressType.SHIPPING,
    }),
    __metadata("design:type", String)
], Add.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Add.prototype, "default", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.adds),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", user_entity_1.User)
], Add.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => UserAdd, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: 'address_id' }),
    __metadata("design:type", UserAdd)
], Add.prototype, "address", void 0);
Add = __decorate([
    (0, typeorm_1.Entity)('add')
], Add);
exports.Add = Add;
//# sourceMappingURL=address.entity.js.map
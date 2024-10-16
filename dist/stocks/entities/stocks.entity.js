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
exports.InventoryStocks = exports.Stocks = void 0;
const openapi = require("@nestjs/swagger");
const order_entity_1 = require("../../orders/entities/order.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
let Stocks = class Stocks {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, orderedQuantity: { required: true, type: () => Number }, ordPendQuant: { required: true, type: () => Number }, dispatchedQuantity: { required: true, type: () => Number }, receivedQuantity: { required: true, type: () => Number }, product: { required: true, type: () => require("../../products/entities/product.entity").Product }, variation_options: { required: true, type: () => require("../../products/entities/product.entity").Variation }, user: { required: true, type: () => require("../../users/entities/user.entity").User }, order: { required: true, type: () => require("../../orders/entities/order.entity").Order } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Stocks.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Stocks.prototype, "orderedQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Stocks.prototype, "ordPendQuant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Stocks.prototype, "dispatchedQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Stocks.prototype, "receivedQuantity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { onDelete: 'SET NULL', onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", product_entity_1.Product)
], Stocks.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Variation, { onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", product_entity_1.Variation)
], Stocks.prototype, "variation_options", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: "SET NULL", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], Stocks.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, { onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", order_entity_1.Order)
], Stocks.prototype, "order", void 0);
Stocks = __decorate([
    (0, typeorm_1.Entity)()
], Stocks);
exports.Stocks = Stocks;
let InventoryStocks = class InventoryStocks {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, quantity: { required: true, type: () => Number }, status: { required: true, type: () => Boolean }, inStock: { required: true, type: () => Boolean }, variation_options: { required: true, type: () => [require("../../products/entities/product.entity").Variation] }, product: { required: true, type: () => require("../../products/entities/product.entity").Product }, user: { required: true, type: () => require("../../users/entities/user.entity").User } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InventoryStocks.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], InventoryStocks.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], InventoryStocks.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], InventoryStocks.prototype, "inStock", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Variation, { onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinTable)({ name: "inventory_stocks_variation_options" }),
    __metadata("design:type", Array)
], InventoryStocks.prototype, "variation_options", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { onDelete: 'SET NULL', onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", product_entity_1.Product)
], InventoryStocks.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL', onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], InventoryStocks.prototype, "user", void 0);
InventoryStocks = __decorate([
    (0, typeorm_1.Entity)()
], InventoryStocks);
exports.InventoryStocks = InventoryStocks;
//# sourceMappingURL=stocks.entity.js.map
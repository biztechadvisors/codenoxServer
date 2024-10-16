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
exports.PermissionType = exports.Permission = void 0;
const openapi = require("@nestjs/swagger");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const typeorm_1 = require("typeorm");
let Permission = class Permission {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, type_name: { required: true, type: () => String }, permission_name: { required: true, type: () => String }, permissions: { required: true, type: () => [require("./permission.entity").PermissionType] }, user: { required: true, type: () => Number }, shop: { required: true, type: () => Number }, shops: { required: false, type: () => [require("../../shops/entities/shop.entity").Shop] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Permission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Permission.prototype, "type_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Permission.prototype, "permission_name", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PermissionType, (permissionType) => permissionType.permissions, { cascade: true, onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Permission.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Permission.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Permission.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => shop_entity_1.Shop, (shop) => shop.additionalPermissions, { onUpdate: "CASCADE" }),
    __metadata("design:type", Array)
], Permission.prototype, "shops", void 0);
Permission = __decorate([
    (0, typeorm_1.Entity)()
], Permission);
exports.Permission = Permission;
let PermissionType = class PermissionType {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, type: { required: true, type: () => String }, read: { required: true, type: () => Boolean }, write: { required: true, type: () => Boolean }, permissions: { required: true, type: () => require("./permission.entity").Permission } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PermissionType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PermissionType.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], PermissionType.prototype, "read", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], PermissionType.prototype, "write", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Permission, permission => permission.permissions, { onDelete: "SET NULL" }),
    __metadata("design:type", Permission)
], PermissionType.prototype, "permissions", void 0);
PermissionType = __decorate([
    (0, typeorm_1.Entity)()
], PermissionType);
exports.PermissionType = PermissionType;
//# sourceMappingURL=permission.entity.js.map
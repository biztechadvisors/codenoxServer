"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePermissionTypeDto = exports.CreatePermissionDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const permission_entity_1 = require("../entities/permission.entity");
class CreatePermissionDto extends (0, swagger_1.PickType)(permission_entity_1.Permission, [
    'id',
    'type_name',
    'permission_name',
    'user'
]) {
    static _OPENAPI_METADATA_FACTORY() {
        return { permissions: { required: true, type: () => [require("./create-permission.dto").CreatePermissionTypeDto] } };
    }
}
exports.CreatePermissionDto = CreatePermissionDto;
class CreatePermissionTypeDto extends (0, swagger_1.PickType)(permission_entity_1.PermissionType, [
    'id',
    'read',
    'write',
    'type',
]) {
    static _OPENAPI_METADATA_FACTORY() {
        return { permission: { required: true, type: () => require("./create-permission.dto").CreatePermissionDto } };
    }
}
exports.CreatePermissionTypeDto = CreatePermissionTypeDto;
//# sourceMappingURL=create-permission.dto.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../entities/user.entity");
class CreateUserDto extends (0, swagger_1.PickType)(user_entity_1.User, [
    'name',
    'email',
    'password',
    'otp',
    'isVerified',
    'is_active',
]) {
    static _OPENAPI_METADATA_FACTORY() {
        return { address: { required: true, type: () => [require("../../address/dto/create-address.dto").CreateAddressDto] }, profile: { required: true, type: () => require("./create-profile.dto").CreateProfileDto }, managed_shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, permission: { required: true, type: () => require("../../permission/entities/permission.entity").Permission } };
    }
}
exports.CreateUserDto = CreateUserDto;
//# sourceMappingURL=create-user.dto.js.map
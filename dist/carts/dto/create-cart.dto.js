"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCartDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const cart_entity_1 = require("../entities/cart.entity");
class CreateCartDto extends (0, swagger_1.PickType)(cart_entity_1.Cart, [
    'customerId',
    'email',
    'phone',
    'cartData',
    'cartQuantity',
    'created_at',
    'updated_at',
]) {
    static _OPENAPI_METADATA_FACTORY() {
        return { customerId: { required: true, type: () => Number }, email: { required: true, type: () => String }, phone: { required: true, type: () => String }, cartData: { required: true, type: () => String }, cartQuantity: { required: true, type: () => Number }, created_at: { required: true, type: () => Date }, updated_at: { required: true, type: () => Date } };
    }
}
exports.CreateCartDto = CreateCartDto;
//# sourceMappingURL=create-cart.dto.js.map
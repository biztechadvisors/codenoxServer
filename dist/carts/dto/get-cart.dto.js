"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCartData = void 0;
const openapi = require("@nestjs/swagger");
class GetCartData {
    static _OPENAPI_METADATA_FACTORY() {
        return { customerId: { required: false, type: () => Number }, email: { required: false, type: () => String } };
    }
}
exports.GetCartData = GetCartData;
//# sourceMappingURL=get-cart.dto.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatestockOrderDto = exports.UpdateInvStkQuantityDto = exports.UpdateStkQuantityDto = exports.GetStocksDto = exports.CreateStocksDto = void 0;
const openapi = require("@nestjs/swagger");
class CreateStocksDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { products: { required: true, type: () => [Object] }, ordPendQuant: { required: true, type: () => Number }, orderedQuantity: { required: true, type: () => Number }, receivedQuantity: { required: true, type: () => Number }, dispatchedQuantity: { required: true, type: () => Number }, quantity: { required: true, type: () => Number }, user_id: { required: true, type: () => Number }, order_id: { required: true, type: () => Number } };
    }
}
exports.CreateStocksDto = CreateStocksDto;
class GetStocksDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { products: { required: true, type: () => [require("../../products/entities/product.entity").Product] }, quantity: { required: true, type: () => Number }, ordPendQuant: { required: true, type: () => Number }, receivedQuantity: { required: true, type: () => Number }, dispatchedQuantity: { required: true, type: () => Number }, user_id: { required: true, type: () => Number }, order_id: { required: true, type: () => Number } };
    }
}
exports.GetStocksDto = GetStocksDto;
class UpdateStkQuantityDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { order_id: { required: true, type: () => Number }, product_id: { required: true, type: () => Number }, updateDispatchQuant: { required: true, type: () => Number } };
    }
}
exports.UpdateStkQuantityDto = UpdateStkQuantityDto;
class UpdateInvStkQuantityDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { order_id: { required: true, type: () => Number }, product_id: { required: true, type: () => Number }, updateReceivedQuantity: { required: true, type: () => Number } };
    }
}
exports.UpdateInvStkQuantityDto = UpdateInvStkQuantityDto;
class CreatestockOrderDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { soldByUserAddress: { required: false, type: () => require("../../orders/dto/create-order.dto").UserAddressInput }, soldBy: { required: false, type: () => require("../../users/entities/user.entity").User }, coupon_id: { required: false, type: () => Number }, status: { required: true, type: () => String }, customer_contact: { required: true, type: () => String }, products: { required: true, type: () => [require("../../orders/dto/create-order.dto").ConnectProductOrderPivot] }, amount: { required: true, type: () => Number }, sales_tax: { required: true, type: () => Number }, total: { required: false, type: () => Number }, paid_total: { required: false, type: () => Number }, payment_id: { required: false, type: () => String }, payment_gateway: { required: false, enum: require("../../orders/entities/order.entity").PaymentGatewayType }, discount: { required: false, type: () => Number }, delivery_fee: { required: false, type: () => Number }, delivery_time: { required: true, type: () => String }, card: { required: false, type: () => require("../../orders/dto/create-order.dto").CardInput }, billing_address: { required: false, type: () => require("../../orders/dto/create-order.dto").UserAddressInput }, shipping_address: { required: false, type: () => require("../../orders/dto/create-order.dto").UserAddressInput }, payment_intent: { required: true, type: () => require("../../payment-intent/entries/payment-intent.entity").PaymentIntent }, language: { required: false, type: () => String }, dealerId: { required: false, type: () => require("../../users/entities/user.entity").User } };
    }
}
exports.CreatestockOrderDto = CreatestockOrderDto;
//# sourceMappingURL=create-stock.dto.js.map
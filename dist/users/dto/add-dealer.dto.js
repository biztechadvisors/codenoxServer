"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealerDto = exports.DealerCategoryMarginDto = exports.DealerProductMarginDto = void 0;
const openapi = require("@nestjs/swagger");
class DealerProductMarginDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, dealer: { required: true, type: () => Number }, product: { required: true, type: () => require("../../products/entities/product.entity").Product }, margin: { required: true, type: () => Number }, isActive: { required: true, type: () => Boolean } };
    }
}
exports.DealerProductMarginDto = DealerProductMarginDto;
class DealerCategoryMarginDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, dealer: { required: true, type: () => Number }, category: { required: true, type: () => require("../../categories/entities/category.entity").Category }, margin: { required: true, type: () => Number }, isActive: { required: true, type: () => Boolean } };
    }
}
exports.DealerCategoryMarginDto = DealerCategoryMarginDto;
class DealerDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, user: { required: true, type: () => require("../entities/user.entity").User }, phone: { required: true, type: () => Number }, name: { required: true, type: () => String }, subscriptionType: { required: true, enum: require("../entities/dealer.entity").SubscriptionType }, subscriptionStart: { required: true, type: () => Date }, subscriptionEnd: { required: true, type: () => Date }, discount: { required: true, type: () => Number }, walletBalance: { required: true, type: () => Number }, isActive: { required: true, type: () => Boolean }, dealerProductMargins: { required: true, type: () => [require("./add-dealer.dto").DealerProductMarginDto] }, dealerCategoryMargins: { required: true, type: () => [require("./add-dealer.dto").DealerCategoryMarginDto] }, gst: { required: true, type: () => String }, pan: { required: true, type: () => String } };
    }
}
exports.DealerDto = DealerDto;
//# sourceMappingURL=add-dealer.dto.js.map
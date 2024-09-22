"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNotificationDto = void 0;
const openapi = require("@nestjs/swagger");
class CreateNotificationDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { message: { required: true, type: () => String }, title: { required: true, type: () => String } };
    }
}
exports.CreateNotificationDto = CreateNotificationDto;
//# sourceMappingURL=create-notification.dto.js.map
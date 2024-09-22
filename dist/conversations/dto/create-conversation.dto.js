"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateConversationDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const conversation_entity_1 = require("../entities/conversation.entity");
class CreateConversationDto extends (0, swagger_1.PickType)(conversation_entity_1.Conversation, [
    'shop_id',
    'unseen',
    'user_id'
]) {
    static _OPENAPI_METADATA_FACTORY() {
        return { latest_message: { required: true, type: () => require("../entities/conversation.entity").LatestMessage }, user: { required: true, type: () => require("../../users/entities/user.entity").User }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop } };
    }
}
exports.CreateConversationDto = CreateConversationDto;
//# sourceMappingURL=create-conversation.dto.js.map
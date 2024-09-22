"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuestionDto = void 0;
const openapi = require("@nestjs/swagger");
const question_entity_1 = require("../entities/question.entity");
const swagger_1 = require("@nestjs/swagger");
class CreateQuestionDto extends (0, swagger_1.PickType)(question_entity_1.Question, [
    'id',
    'question',
    'answer',
    'shop_id',
    'positive_feedbacks_count',
    'negative_feedbacks_count',
    'created_at',
    'updated_at',
]) {
    static _OPENAPI_METADATA_FACTORY() {
        return { product: { required: true, type: () => require("../../products/entities/product.entity").Product }, user: { required: true, type: () => require("../../users/entities/user.entity").User }, feedback: { required: true, type: () => require("../../feedbacks/entities/feedback.entity").Feedback } };
    }
}
exports.CreateQuestionDto = CreateQuestionDto;
//# sourceMappingURL=create-question.dto.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionModule = void 0;
const common_1 = require("@nestjs/common");
const my_questions_controller_1 = require("./my-questions.controller");
const my_questions_service_1 = require("./my-questions.service");
const questions_controller_1 = require("./questions.controller");
const questions_service_1 = require("./questions.service");
const typeorm_1 = require("@nestjs/typeorm");
const question_entity_1 = require("./entities/question.entity");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const feedback_entity_1 = require("../feedbacks/entities/feedback.entity");
let QuestionModule = class QuestionModule {
};
QuestionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([question_entity_1.Question, feedback_entity_1.Feedback, user_entity_1.User, product_entity_1.Product])],
        controllers: [questions_controller_1.QuestionController, my_questions_controller_1.MyQuestionsController],
        providers: [questions_service_1.QuestionService, my_questions_service_1.MyQuestionsService],
    })
], QuestionModule);
exports.QuestionModule = QuestionModule;
//# sourceMappingURL=questions.module.js.map
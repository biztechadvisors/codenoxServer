"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyQuestionsService = void 0;
const common_1 = require("@nestjs/common");
let MyQuestionsService = class MyQuestionsService {
    findMyQuestions({ limit, page, search, answer }) {
        if (!page)
            page = 1;
        if (!limit)
            limit = 8;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        return {};
    }
    findMyQuestion(id) {
        return [];
    }
    create(createQuestionDto) {
        return [];
    }
    update(id, updateQuestionDto) {
        return [];
    }
    delete(id) {
        return [];
    }
};
MyQuestionsService = __decorate([
    (0, common_1.Injectable)()
], MyQuestionsService);
exports.MyQuestionsService = MyQuestionsService;
//# sourceMappingURL=my-questions.service.js.map
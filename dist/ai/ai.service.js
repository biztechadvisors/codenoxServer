"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const ai_entity_1 = require("./entities/ai.entity");
const typeorm_1 = require("@nestjs/typeorm");
const generative_ai_1 = require("@google/generative-ai");
const typeorm_2 = require("typeorm");
let AiService = class AiService {
    constructor(aiRepository) {
        this.aiRepository = aiRepository;
    }
    async create(createAiDto) {
        const newPrompt = new ai_entity_1.Ai();
        const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(createAiDto.prompt);
        const response = await result.response;
        const text = response.text();
        newPrompt.result = text;
        newPrompt.status = 'success';
        const newAddPrompt = await this.aiRepository.save(newPrompt);
        return newAddPrompt;
    }
    async remove() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const aiData = await this.aiRepository.find({
            where: {
                updated_at: (0, typeorm_2.LessThan)(twentyFourHoursAgo),
            },
        });
        for (const data of aiData) {
            const removed = await this.aiRepository.delete(data.id);
        }
    }
};
AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_entity_1.Ai)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AiService);
exports.AiService = AiService;
//# sourceMappingURL=ai.service.js.map
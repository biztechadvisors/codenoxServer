"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_controller_1 = require("./ai.controller");
const ai_service_1 = require("./ai.service");
const typeorm_1 = require("@nestjs/typeorm");
const ai_entity_1 = require("./entities/ai.entity");
const typeorm_ex_module_1 = require("../typeorm-ex/typeorm-ex.module");
const ai_repository_1 = require("./ai.repository");
let AiModule = class AiModule {
};
AiModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_ex_module_1.TypeOrmExModule.forCustomRepository([ai_repository_1.AiRepository]), typeorm_1.TypeOrmModule.forFeature([ai_entity_1.Ai])],
        controllers: [ai_controller_1.AiController],
        providers: [ai_service_1.AiService],
    })
], AiModule);
exports.AiModule = AiModule;
//# sourceMappingURL=ai.module.js.map
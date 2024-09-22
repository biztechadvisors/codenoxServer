"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiprocketServiceEnv = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const axios_1 = __importDefault(require("axios"));
const schedule_1 = require("@nestjs/schedule");
let ShiprocketServiceEnv = class ShiprocketServiceEnv {
    constructor() {
        this.envFilePath = '.env';
    }
    async fetchToken() {
        try {
            const email = process.env.SHIPROCKET_EMAIL;
            const password = process.env.SHIPROCKET_PASSWORD;
            const response = await axios_1.default.post('https://apiv2.shiprocket.in/v1/external/auth/login', { email, password });
            const token = response.data.token;
            this.updateEnvFile({ SHIPROCKET_TOKEN: token });
            return token;
        }
        catch (error) {
            console.error('Error fetching Shiprocket token:', error);
            throw error;
        }
    }
    updateEnvFile(newVariables) {
        const currentEnvContent = fs.readFileSync(this.envFilePath, 'utf-8');
        const currentEnvObject = currentEnvContent.split('\n').reduce((acc, line) => {
            const [key, value] = line.split('=');
            acc[key] = value;
            return acc;
        }, {});
        const updateEnvObject = Object.assign(Object.assign({}, currentEnvObject), newVariables);
        const updateEnvContent = Object.entries(updateEnvObject).map(([key, value]) => `${key}=${value}`).join('/n');
        fs.writeFileSync(this.envFilePath, updateEnvContent);
    }
    async scheduleTokenUpdate() {
        try {
            await this.fetchToken();
        }
        catch (error) {
            console.error('Error scheduling token update:', error);
        }
    }
};
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_12_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShiprocketServiceEnv.prototype, "scheduleTokenUpdate", null);
ShiprocketServiceEnv = __decorate([
    (0, common_1.Injectable)()
], ShiprocketServiceEnv);
exports.ShiprocketServiceEnv = ShiprocketServiceEnv;
//# sourceMappingURL=updateEnv.js.map
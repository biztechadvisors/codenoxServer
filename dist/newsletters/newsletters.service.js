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
exports.NewslettersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const newsletters_repository_1 = require("./newsletters.repository");
const newsletters_entity_1 = require("./entities/newsletters.entity");
let NewslettersService = class NewslettersService {
    constructor(newsLetterRepository) {
        this.newsLetterRepository = newsLetterRepository;
    }
    async subscribeToNewsletter({ email }) {
        const newLetter = new newsletters_entity_1.NewsLetter();
        const findEmail = await this.newsLetterRepository.find({
            where: { email: email }
        });
        if (findEmail) {
            return `Your email is already subscribed to our newsletter.`;
        }
        else {
            try {
                newLetter.email = email;
                await this.newsLetterRepository.save(newLetter);
                return `Your email successfully subscribed to our newsletter.`;
            }
            catch (error) {
                console.error(error);
            }
        }
    }
};
NewslettersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(newsletters_repository_1.NewsLetterRepository)),
    __metadata("design:paramtypes", [newsletters_repository_1.NewsLetterRepository])
], NewslettersService);
exports.NewslettersService = NewslettersService;
//# sourceMappingURL=newsletters.service.js.map
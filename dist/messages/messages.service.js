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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const message_entity_1 = require("./entities/message.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("../conversations/entities/conversation.entity");
const paginate_1 = require("../common/pagination/paginate");
let MessagesService = class MessagesService {
    constructor(messageRepository, conversationRepository, latestMessageRepository) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.latestMessageRepository = latestMessageRepository;
    }
    async createMessage(createMessageDto) {
        const message = new message_entity_1.Message();
        const conversationCheck = await this.conversationRepository.findOne({
            where: { shop_id: createMessageDto.conversation.shop_id, user_id: createMessageDto.conversation.user_id },
            relations: ['latest_message', 'shop_id']
        });
        if (conversationCheck) {
            const latestMessage = await this.latestMessageRepository.findOne({
                where: { conversation_id: conversationCheck.id, user_id: createMessageDto.conversation.latest_message.user_id }
            });
            if (latestMessage) {
                latestMessage.body = createMessageDto.conversation.latest_message.body;
                await this.latestMessageRepository.save(latestMessage);
            }
            else {
                console.log("Latest Message Not Found");
            }
            message.conversation = conversationCheck;
            message.conversation_id = conversationCheck.id;
            message.body = createMessageDto.conversation.latest_message.body;
            message.user_id = createMessageDto.conversation.latest_message.user_id;
            await this.messageRepository.save(message);
        }
        else {
            const conversation = new conversation_entity_1.Conversation();
            conversation.unseen = createMessageDto.conversation.unseen;
            conversation.shop_id = createMessageDto.conversation.shop_id;
            conversation.shop = createMessageDto.conversation.shop;
            conversation.user = createMessageDto.conversation.user;
            conversation.user_id = createMessageDto.conversation.user_id;
            const savedConversation = await this.conversationRepository.save(conversation);
            const latestMessage = new conversation_entity_1.LatestMessage();
            latestMessage.body = createMessageDto.conversation.latest_message.body;
            latestMessage.conversation_id = savedConversation.id;
            latestMessage.user_id = createMessageDto.conversation.latest_message.user_id;
            const savedLatestMessage = await this.latestMessageRepository.save(latestMessage);
            savedConversation.latest_message = savedLatestMessage;
            await this.conversationRepository.save(savedConversation);
            message.conversation = savedConversation;
            message.conversation_id = conversationCheck.id;
            message.body = createMessageDto.conversation.latest_message.body;
            message.user_id = createMessageDto.conversation.latest_message.user_id;
            await this.messageRepository.save(message);
        }
    }
    async getMessages({ search, limit, page, shop }) {
        let shopSearch;
        let message = await this.messageRepository.find({
            relations: [
                'conversation',
                'conversation.latest_message',
                'conversation.user',
                'conversation.shop',
                'conversation.shop.balance',
                'conversation.shop.cover_image',
                'conversation.shop.logo',
                'conversation.shop.address'
            ]
        });
        if (search) {
            message = message.filter((msg) => msg.conversation);
        }
        if (shop) {
            shopSearch = await this.conversationRepository.findOne({
                where: {
                    shop_id: shop.id
                }
            });
            return shopSearch;
        }
        const url = `/message?limit=${limit}`;
        const paginatedData = (0, paginate_1.paginate)(message.length, page, limit, message.length, url);
        return Object.assign({ data: message.slice(paginatedData.firstItem, paginatedData.lastItem + 1) }, paginatedData);
    }
};
MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(2, (0, typeorm_1.InjectRepository)(conversation_entity_1.LatestMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MessagesService);
exports.MessagesService = MessagesService;
//# sourceMappingURL=messages.service.js.map
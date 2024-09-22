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
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const paginate_1 = require("../common/pagination/paginate");
const conversation_entity_1 = require("./entities/conversation.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../messages/entities/message.entity");
const options = {
    keys: ['shop.name'],
    threshold: 0.3,
};
let ConversationsService = class ConversationsService {
    constructor(conversationRepository, latestMessageRepository, messageRepository) {
        this.conversationRepository = conversationRepository;
        this.latestMessageRepository = latestMessageRepository;
        this.messageRepository = messageRepository;
    }
    async create(createConversationDto) {
        const message = new message_entity_1.Message();
        const conversationCheck = await this.conversationRepository.findOne({
            where: { shop_id: createConversationDto.shop_id, user_id: createConversationDto.user_id }
        });
        if (conversationCheck) {
            const latestMessage = await this.latestMessageRepository.findOne({
                where: {
                    conversation_id: conversationCheck.id,
                    user_id: createConversationDto.latest_message.user_id
                }
            });
            if (latestMessage) {
                latestMessage.body = createConversationDto.latest_message.body;
                await this.latestMessageRepository.save(latestMessage);
            }
            else {
                const latestMessage = new conversation_entity_1.LatestMessage();
                latestMessage.body = createConversationDto.latest_message.body;
                latestMessage.conversation_id = conversationCheck.id;
                latestMessage.user_id = createConversationDto.latest_message.user_id;
                await this.latestMessageRepository.save(latestMessage);
            }
            message.body = createConversationDto.latest_message.body;
            message.conversation = conversationCheck;
            message.conversation_id = conversationCheck.id;
            message.user_id = createConversationDto.latest_message.user_id;
            await this.messageRepository.save(message);
        }
        else {
            const conversation = new conversation_entity_1.Conversation();
            conversation.unseen = createConversationDto.unseen;
            const savedConversation = await this.conversationRepository.save(conversation);
            const latestMessage = new conversation_entity_1.LatestMessage();
            latestMessage.body = createConversationDto.latest_message.body;
            latestMessage.conversation_id = savedConversation.id;
            latestMessage.user_id = createConversationDto.latest_message.user_id;
            const latest_message = await this.latestMessageRepository.save(latestMessage);
            conversation.latest_message = latest_message;
            conversation.shop_id = createConversationDto.shop_id;
            conversation.shop = createConversationDto.shop;
            conversation.user = createConversationDto.user;
            conversation.user_id = createConversationDto.user_id;
            await this.conversationRepository.save(savedConversation);
            const message = new message_entity_1.Message();
            message.body = createConversationDto.latest_message.body;
            message.conversation = savedConversation;
            message.conversation_id = savedConversation.id;
            message.user_id = createConversationDto.latest_message.user_id;
            await this.messageRepository.save(message);
            return savedConversation;
        }
    }
    async getAllConversations({ page, limit, search }) {
        if (!page)
            page = 1;
        let conversations = await this.conversationRepository.find({ relations: ['latest_message', 'user', 'shop', 'shop.balance', 'shop.cover_image', 'shop.logo', 'shop.address'] });
        if (search) {
            const parseSearchParams = search.split(';');
            const searchText = [];
            for (const searchParam of parseSearchParams) {
                const [key, value] = searchParam.split(':');
                if (key !== 'slug') {
                    searchText.push({
                        [key]: value,
                    });
                }
            }
            conversations = conversations.filter((con) => searchText.every((searchItem) => Object.entries(searchItem).every(([key, value]) => con[key] === value)));
        }
        const url = `/conversations?limit=${limit}`;
        const paginatedData = (0, paginate_1.paginate)(conversations.length, page, limit, conversations.length, url);
        return Object.assign({ data: conversations.slice(paginatedData.firstItem, paginatedData.lastItem + 1) }, paginatedData);
    }
    getConversation(param) {
        return this.conversationRepository.find({ where: { shop_id: param }, relations: ['latest_message', 'user', 'shop', 'shop.balance', 'shop.cover_image', 'shop.logo', 'shop.address'] });
    }
};
ConversationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(conversation_entity_1.LatestMessage)),
    __param(2, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConversationsService);
exports.ConversationsService = ConversationsService;
//# sourceMappingURL=conversations.service.js.map
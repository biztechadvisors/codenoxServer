import { CreateConversationDto } from './dto/create-conversation.dto';
import { Conversation, LatestMessage } from './entities/conversation.entity';
import { GetConversationsDto } from './dto/get-conversations.dto';
import { Repository } from 'typeorm';
import { Message } from 'src/messages/entities/message.entity';
export declare class ConversationsService {
    private readonly conversationRepository;
    private readonly latestMessageRepository;
    private readonly messageRepository;
    constructor(conversationRepository: Repository<Conversation>, latestMessageRepository: Repository<LatestMessage>, messageRepository: Repository<Message>);
    create(createConversationDto: CreateConversationDto): Promise<Conversation>;
    getAllConversations({ page, limit, search }: GetConversationsDto): Promise<{
        count: number;
        current_page: number;
        firstItem: number;
        lastItem: number;
        last_page: number;
        per_page: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
        next_page_url: string;
        prev_page_url: string;
        data: Conversation[];
    }>;
    getConversation(param: number): Promise<Conversation[]>;
}

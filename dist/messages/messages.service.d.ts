import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetConversationsDto } from 'src/conversations/dto/get-conversations.dto';
import { Repository } from 'typeorm';
import { Conversation, LatestMessage } from 'src/conversations/entities/conversation.entity';
export declare class MessagesService {
    private readonly messageRepository;
    private readonly conversationRepository;
    private readonly latestMessageRepository;
    constructor(messageRepository: Repository<Message>, conversationRepository: Repository<Conversation>, latestMessageRepository: Repository<LatestMessage>);
    createMessage(createMessageDto: CreateMessageDto): Promise<void>;
    getMessages({ search, limit, page, shop }: GetConversationsDto): Promise<any>;
}

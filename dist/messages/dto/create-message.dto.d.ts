import { Message } from '../entities/message.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
declare const CreateMessageDto_base: import("@nestjs/common").Type<Pick<Message, "body" | "conversation_id">>;
export declare class CreateMessageDto extends CreateMessageDto_base {
    conversation: Conversation;
    user_id: number;
}
export {};

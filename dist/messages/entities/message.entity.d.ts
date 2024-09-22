import { Conversation, LatestMessage } from 'src/conversations/entities/conversation.entity';
export declare class Message extends LatestMessage {
    id: number;
    conversation: Conversation;
}

/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger';
import { Message } from '../entities/message.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';

export class CreateMessageDto extends PickType(Message,
    ['body',
        'conversation_id'])
{
    conversation: Conversation
    user_id: number;
}
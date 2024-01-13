/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, LatestMessage } from './entities/conversation.entity';
import { Message } from 'src/messages/entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, LatestMessage, Message])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule { }
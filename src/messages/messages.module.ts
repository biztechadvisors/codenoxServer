/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Conversation, LatestMessage } from 'src/conversations/entities/conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation, LatestMessage])],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule { }
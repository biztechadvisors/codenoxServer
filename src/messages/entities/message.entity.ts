/* eslint-disable prettier/prettier */
import {
  Conversation,
  LatestMessage,
} from 'src/conversations/entities/conversation.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message extends LatestMessage {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Conversation)
  conversation: Conversation;
}

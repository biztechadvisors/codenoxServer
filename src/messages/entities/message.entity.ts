/* eslint-disable prettier/prettier */
import {
  Conversation,
  LatestMessage,
} from 'src/conversations/entities/conversation.entity'
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Message extends LatestMessage {
  @PrimaryGeneratedColumn()
  id: number
  @OneToOne(() => Conversation)
  conversation: Conversation
}

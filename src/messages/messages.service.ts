/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import MessagesJson from '@db/messages.json';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetConversationsDto } from 'src/conversations/dto/get-conversations.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, LatestMessage } from 'src/conversations/entities/conversation.entity';
import { paginate } from 'src/common/pagination/paginate';

const messages = plainToClass(Message, MessagesJson);

@Injectable()
export class MessagesService {
  private messages: Message[] = messages;
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(LatestMessage)
    private readonly latestMessageRepository: Repository<LatestMessage>

  ) { }


  async createMessage(createMessageDto: CreateMessageDto) {
    const message = new Message();

    const conversationCheck = await this.conversationRepository.findOne({
      where: { shop_id: createMessageDto.conversation.shop_id, user_id: createMessageDto.conversation.user_id },
      relations: ['latest_message']
    });

    console.log(conversationCheck);

    if (conversationCheck) {
      const latestMessage = await this.latestMessageRepository.findOne({
        where: { conversation_id: conversationCheck.id, user_id: createMessageDto.conversation.latest_message.user_id }
      });

      console.log(latestMessage);

      if (latestMessage) {
        latestMessage.body = createMessageDto.conversation.latest_message.body;
        await this.latestMessageRepository.save(latestMessage);
      } else {
        console.log("Latest Message Not Found");
      }
      message.conversation = conversationCheck;
      message.conversation_id = conversationCheck.id;
      message.body = createMessageDto.conversation.latest_message.body;
      message.user_id = createMessageDto.conversation.latest_message.user_id;
      await this.messageRepository.save(message);
    } else {
      const conversation = new Conversation();
      conversation.unseen = createMessageDto.conversation.unseen;
      conversation.shop_id = createMessageDto.conversation.shop_id;
      conversation.shop = createMessageDto.conversation.shop;
      conversation.user = createMessageDto.conversation.user;
      conversation.user_id = createMessageDto.conversation.user_id;

      const savedConversation = await this.conversationRepository.save(conversation);

      const latestMessage = new LatestMessage();
      latestMessage.body = createMessageDto.conversation.latest_message.body;
      latestMessage.conversation_id = savedConversation.id;
      latestMessage.user_id = createMessageDto.conversation.latest_message.user_id;

      const savedLatestMessage = await this.latestMessageRepository.save(latestMessage);

      savedConversation.latest_message = savedLatestMessage;
      await this.conversationRepository.save(savedConversation);

      message.conversation = savedConversation;
      message.conversation_id = conversationCheck.id;
      message.body = createMessageDto.conversation.latest_message.body;
      message.user_id = createMessageDto.conversation.latest_message.user_id;
      await this.messageRepository.save(message);
    }
  }

  async getMessages({ search, limit, page }: GetConversationsDto) {
    let message = await this.messageRepository.find({ relations: ['conversation', 'conversation.latest_message', 'conversation.user', 'conversation.shop', 'conversation.shop.balance', 'conversation.shop.cover_image', 'conversation.shop.logo', 'conversation.shop.address'] });
    if (search) {
      message = message.filter((msg) => msg.conversation);
    }
    const url = `/message?limit=${limit}`;
    const paginatedData = paginate(messages.length, page, limit, messages.length, url);
    return {
      data: message.slice(paginatedData.firstItem, paginatedData.lastItem + 1),
      ...paginatedData,
    };
  }
}
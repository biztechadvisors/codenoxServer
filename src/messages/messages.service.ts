/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetConversationsDto } from 'src/conversations/dto/get-conversations.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, LatestMessage } from 'src/conversations/entities/conversation.entity';
import { paginate } from 'src/common/pagination/paginate';

// const messages = plainToClass(Message, MessagesJson);

@Injectable()
export class MessagesService {
  // private message: Message[] = messages;
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(LatestMessage)
    private readonly latestMessageRepository: Repository<LatestMessage>

  ) { }


  async createMessage(createMessageDto: CreateMessageDto) {
    console.log("createMessage", createMessageDto)
    const message = new Message();

    const conversationCheck = await this.conversationRepository.findOne({
      where: { 
        shop_id: createMessageDto.conversation.shop_id, 
        user_id: createMessageDto.conversation.user_id,
        dealer_id: createMessageDto.conversation.dealer_id 
      },
      relations: [
        'latest_message', 
        'shop_id', 
        'dealer_id'
      ]
    });
     console.log("conversation", conversationCheck)
    if (conversationCheck) {
      const latestMessage = await this.latestMessageRepository.findOne({
        where: { conversation_id: conversationCheck.id, user_id: createMessageDto.conversation.latest_message.user_id }
      });

      console.log("latest Messages", latestMessage)
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
      conversation.dealer_id = createMessageDto.conversation.dealer_id;
      conversation.dealer = createMessageDto.conversation.dealer;

      const savedConversation = await this.conversationRepository.save(conversation);

      // const latestMessage = new LatestMessage();
      // latestMessage.body = createMessageDto.conversation.latest_message.body;
      // latestMessage.conversation_id = savedConversation.id;
      // latestMessage.user_id = createMessageDto.conversation.latest_message.user_id;

      // const savedLatestMessage = await this.latestMessageRepository.save(latestMessage);

      // savedConversation.latest_message = savedLatestMessage;
      // await this.conversationRepository.save(savedConversation);

      message.conversation = savedConversation;
      message.conversation_id = conversationCheck.id;
      message.body = createMessageDto.conversation.latest_message.body;
      message.user_id = createMessageDto.conversation.latest_message.user_id;
      await this.messageRepository.save(message);
    }
  }

  async getMessages({ search, limit, page, conversation }: GetConversationsDto) {
    // let shopSearch
    // conversation = 25
    let message = await this.messageRepository.find({ 
      where: {
        conversation_id: conversation
      },
      relations: [
        'conversation',
        'conversation.latest_message',
        'conversation.dealer',
        'conversation.user',
        'conversation.shop',
        'conversation.shop.balance',
        'conversation.shop.cover_image',
        'conversation.shop.logo',
        'conversation.shop.address'
              ] });
              console.log("message_________", message)

    if (search) {
      message = message.filter((msg) => msg.conversation);
    }

    // if(shop){
    //  shopSearch = await this.conversationRepository.findOne({
    //   where: {
    //    shop_id: shop.id
    //   }
    //  })
    //  return shopSearch
    // }
    
    const url = `/message?limit=${limit}`;
    const paginatedData = paginate(message.length, page, limit, message.length, url);
    return {
      data: message.slice(paginatedData.firstItem, paginatedData.lastItem + 1),
      ...paginatedData,
    };
  }
}
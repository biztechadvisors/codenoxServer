/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import ConversationsJson from '@db/conversations.json';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Conversation, LatestMessage } from './entities/conversation.entity';
import { GetConversationsDto } from './dto/get-conversations.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from 'src/messages/entities/message.entity';

// For conversations
const conversations = plainToClass(Conversation, ConversationsJson);
const options = {
  keys: ['shop.name'],
  threshold: 0.3,
};
const fuse = new Fuse(conversations, options);

@Injectable()
export class ConversationsService {
  private conversations: Conversation[] = conversations;
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(LatestMessage)
    private readonly latestMessageRepository : Repository<LatestMessage>,
    @InjectRepository(Message)
    private readonly messageRepository : Repository<Message>,
    
    ){}

    async create(createConversationDto: CreateConversationDto) {
      const message = new Message()
      const conversationCheck = await this.conversationRepository.findOne({
        where: { shop_id: createConversationDto.shop_id, user_id: createConversationDto.user_id }
      });
    
      if (conversationCheck) {
        const latestMessage = await this.latestMessageRepository.findOne({
          where: {
            conversation_id: conversationCheck.id,
            user_id: createConversationDto.latest_message.user_id
          }
        });
        console.log(latestMessage);
        console.log(createConversationDto.latest_message.body);
  
        if (latestMessage) {
          // console.log("Work")
          latestMessage.body = createConversationDto.latest_message.body;
          await this.latestMessageRepository.save(latestMessage);
        } else {
          // console.log("Work1")

          const latestMessage = new LatestMessage();
          latestMessage.body = createConversationDto.latest_message.body;
          latestMessage.conversation_id = conversationCheck.id;
          latestMessage.user_id = createConversationDto.latest_message.user_id;
          await this.latestMessageRepository.save(latestMessage);
        }

        message.body = createConversationDto.latest_message.body
        message.conversation = conversationCheck
        message.conversation_id = conversationCheck.id
        message.user_id = createConversationDto.latest_message.user_id
        await this.messageRepository.save(message)
        // console.log("first")
      } else {
        // console.log("first==========else")

        const conversation = new Conversation();
        conversation.unseen = createConversationDto.unseen;
        const savedConversation = await this.conversationRepository.save(conversation);
          const latestMessage = new LatestMessage();
          latestMessage.body = createConversationDto.latest_message.body;
          latestMessage.conversation_id = savedConversation.id;
          latestMessage.user_id = createConversationDto.latest_message.user_id;
          const latest_message = await this.latestMessageRepository.save(latestMessage);
        conversation.latest_message = latest_message
        conversation.shop_id = createConversationDto.shop_id
        conversation.shop = createConversationDto.shop
        conversation.user = createConversationDto.user
        conversation.user_id = createConversationDto.user_id
        console.log(conversation)
        await this.conversationRepository.save(savedConversation);
        
        const message = new Message()
        message.body = createConversationDto.latest_message.body
        message.conversation = savedConversation
        message.conversation_id = savedConversation.id
        message.user_id = createConversationDto.latest_message.user_id
        await this.messageRepository.save(message)
        return savedConversation;
      }
    }
    
    async getAllConversations({ page, limit, search }: GetConversationsDto) {
      if (!page) page = 1;
    
      let conversations = await this.conversationRepository.find({relations:['latest_message','user','shop','shop.balance','shop.cover_image','shop.logo','shop.address']});
    
      if (search) {
        const parseSearchParams = search.split(';');
        const searchText: any = [];
    
        for (const searchParam of parseSearchParams) {
          const [key, value] = searchParam.split(':');
          // TODO: Temp Solution
          if (key !== 'slug') {
            searchText.push({
              [key]: value,
            });
          }
        }
    
        conversations = conversations.filter((con) =>
          searchText.every((searchItem) =>
            Object.entries(searchItem).every(([key, value]) => con[key] === value)
          )
        );
      }
    
      const url = `/conversations?limit=${limit}`;
      const paginatedData = paginate(conversations.length, page, limit, conversations.length, url);
    
      return {
        data: conversations.slice(paginatedData.firstItem, paginatedData.lastItem + 1),
        ...paginatedData,
      };
    }

  getConversation(param: number) {
    return this.conversationRepository.find({where:{shop_id:param}, relations:['latest_message','user','shop','shop.balance','shop.cover_image','shop.logo','shop.address']});
  }
}

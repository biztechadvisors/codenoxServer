/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { CreateNewSubscriberDto } from './dto/create-new-subscriber.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { NewsLetterRepository } from './newsletters.repository'
import { NewsLetter } from './entities/newsletters.entity'

@Injectable()
export class NewslettersService {
  constructor(
    @InjectRepository(NewsLetterRepository)
    private newsLetterRepository: NewsLetterRepository
  ){}

  async subscribeToNewsletter({ email }: CreateNewSubscriberDto) {
    const newLetter = new NewsLetter()

    const findEmail = await this.newsLetterRepository.find({
      where: {email: email}
    })

    if(findEmail){

       return `Your email is already subscribed to our newsletter.`

    } else {
      try {
        newLetter.email = email
        await this.newsLetterRepository.save(newLetter)
        return `Your email successfully subscribed to our newsletter.`

      } catch(error){
        console.error(error);
      }
      

    }
  }
}

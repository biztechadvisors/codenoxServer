/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { CreateAiDto } from './dto/create-ai.dto'
import { Ai } from './entities/ai.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { AiRepository } from './ai.repository'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Interval } from '@nestjs/schedule'
import { LessThan } from 'typeorm'

@Injectable()
export class AiService {

  constructor(
    @InjectRepository(Ai)
    private aiRepository: AiRepository
  ){}
  async create(createAiDto: CreateAiDto): Promise<Ai> {

    const newPrompt = new Ai()
    
    const genAI = new GoogleGenerativeAI(process.env.API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const result = await model.generateContent(createAiDto.prompt)

    const response = await result.response
    const text = response.text()

    newPrompt.result = text
    newPrompt.status = 'success'

    const newAddPrompt = await this.aiRepository.save(newPrompt)
    
    return newAddPrompt
  }

  // @Interval(60000)
  async remove() {

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const aiData = await this.aiRepository.find({
      where: {
        updated_at: LessThan(twentyFourHoursAgo), 
       
      },
    });

    for (const data of aiData) {

    const removed = await this.aiRepository.delete(data.id)

  }
}
}

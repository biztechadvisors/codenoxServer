import { Injectable } from '@nestjs/common'
import { CreateAiDto } from './dto/create-ai.dto'
import { Ai } from './entities/ai.entity'

@Injectable()
export class AiService {
  create(createAiDto: CreateAiDto): Ai {
    return {
      id: 1,
      status: 'success',
      result: 'This a dummy response for dummy api.',
    }
  }
}

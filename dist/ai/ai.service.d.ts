import { CreateAiDto } from './dto/create-ai.dto';
import { Ai } from './entities/ai.entity';
import { AiRepository } from './ai.repository';
export declare class AiService {
    private aiRepository;
    constructor(aiRepository: AiRepository);
    create(createAiDto: CreateAiDto): Promise<Ai>;
    remove(): Promise<void>;
}

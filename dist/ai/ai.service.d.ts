import { CreateAiDto } from './dto/create-ai.dto';
import { Ai } from './entities/ai.entity';
import { Repository } from 'typeorm';
export declare class AiService {
    private aiRepository;
    constructor(aiRepository: Repository<Ai>);
    create(createAiDto: CreateAiDto): Promise<Ai>;
    remove(): Promise<void>;
}

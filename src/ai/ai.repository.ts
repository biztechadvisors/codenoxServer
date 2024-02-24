/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { Ai } from './entities/ai.entity';
import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator';

@CustomRepository(Ai)
export class AiRepository extends Repository<Ai> { }

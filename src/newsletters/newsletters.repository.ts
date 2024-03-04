/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { NewsLetter } from './entities/newsletters.entity';
import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator';

@CustomRepository(NewsLetter)
export class NewsLetterRepository extends Repository<NewsLetter> { }

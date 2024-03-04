/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { Author } from './entities/author.entity';
import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator';

@CustomRepository(Author)
export class AuthorRepository extends Repository<Author> { }

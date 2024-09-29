import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';
import { GetAuthorDto } from './dto/get-author.dto';
import { GetTopAuthorsDto } from './dto/get-top-authors.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { ShopSocials } from 'src/settings/entities/setting.entity';
import { Repository } from 'typeorm';
import { Attachment } from '../common/entities/attachment.entity';
export declare class AuthorsService {
    private authorRepository;
    private shopSocialsRepository;
    private attachmentRepository;
    constructor(authorRepository: Repository<Author>, shopSocialsRepository: Repository<ShopSocials>, attachmentRepository: Repository<Attachment>);
    convertToSlug(text: any): Promise<any>;
    create(createAuthorDto: CreateAuthorDto): Promise<Author>;
    getAuthors({ page, limit, search, is_approved }: GetAuthorDto): Promise<{
        count: number;
        current_page: number;
        firstItem: number;
        lastItem: number;
        last_page: number;
        per_page: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
        next_page_url: string;
        prev_page_url: string;
        data: Author[];
    }>;
    getAuthorBySlug(slug: string): Promise<Author>;
    getTopAuthors({ limit }: GetTopAuthorsDto): Promise<Author[]>;
    update(id: number, updateAuthorDto: UpdateAuthorDto): Promise<Author>;
    remove(id: number): Promise<Author | ShopSocials[]>;
}

import { CreateNewSubscriberDto } from './dto/create-new-subscriber.dto';
import { NewsLetter } from './entities/newsletters.entity';
import { Repository } from 'typeorm';
export declare class NewslettersService {
    private newsLetterRepository;
    constructor(newsLetterRepository: Repository<NewsLetter>);
    subscribeToNewsletter({ email }: CreateNewSubscriberDto): Promise<"Your email is already subscribed to our newsletter." | "Your email successfully subscribed to our newsletter.">;
}

import { CreateNewSubscriberDto } from './dto/create-new-subscriber.dto';
import { NewsLetterRepository } from './newsletters.repository';
export declare class NewslettersService {
    private newsLetterRepository;
    constructor(newsLetterRepository: NewsLetterRepository);
    subscribeToNewsletter({ email }: CreateNewSubscriberDto): Promise<"Your email is already subscribed to our newsletter." | "Your email successfully subscribed to our newsletter.">;
}

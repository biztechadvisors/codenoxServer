import { NewslettersService } from './newsletters.service';
import { CreateNewSubscriberDto } from './dto/create-new-subscriber.dto';
export declare class NewslettersController {
    private newslettersService;
    constructor(newslettersService: NewslettersService);
    subscribeToNewsletter(body: CreateNewSubscriberDto): Promise<"Your email is already subscribed to our newsletter." | "Your email successfully subscribed to our newsletter.">;
}

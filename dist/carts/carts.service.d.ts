import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { GetCartData } from './dto/get-cart.dto';
import { Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
export declare class AbandonedCartService {
    private cartRepository;
    private mailService;
    constructor(cartRepository: Repository<Cart>, mailService: MailService);
    create(createCartDto: CreateCartDto): Promise<Cart>;
    getCartData(param: GetCartData): Promise<{
        products: any[];
        totalCount: number;
    }>;
    delete(itemId: string, query?: any): Promise<any>;
    clearCart(email: string): Promise<string>;
    sendAbandonedCartReminder(): Promise<void>;
}

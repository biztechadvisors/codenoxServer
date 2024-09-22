import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartRepository } from './carts.repository';
import { GetCartData } from './dto/get-cart.dto';
import { MailService } from 'src/mail/mail.service';
export declare class AbandonedCartService {
    private cartRepository;
    private mailService;
    constructor(cartRepository: CartRepository, mailService: MailService);
    create(createCartDto: CreateCartDto): Promise<Cart>;
    getCartData(param: GetCartData): Promise<{
        products: any[];
        totalCount: number;
    }>;
    delete(itemId: string, query?: any): Promise<any>;
    clearCart(email: string): Promise<string>;
    sendAbandonedCartReminder(): Promise<void>;
}

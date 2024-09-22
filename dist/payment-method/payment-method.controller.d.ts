import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { GetPaymentMethodsDto } from './dto/get-payment-methods.dto';
import { DefaultCart } from './dto/set-default-card.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodService } from './payment-method.service';
import { User } from 'src/users/entities/user.entity';
import { PaymentMethod } from './entities/payment-method.entity';
export declare class PaymentMethodController {
    private readonly paymentMethodService;
    constructor(paymentMethodService: PaymentMethodService);
    create(createPaymentMethodDto: CreatePaymentMethodDto, user: User): Promise<{
        id: number;
        method_key: string;
        payment_gateway_id: number;
        default_card: boolean;
        fingerprint: string;
        owner_name: string;
        last4: string;
        expires: string;
        network: string;
        type: string;
        origin: string;
        verification_check: any;
        created_at: Date;
        updated_at: Date;
    } & PaymentMethod>;
    findAll(query: GetPaymentMethodsDto): Promise<PaymentMethod[]>;
    findOne(id: string): Promise<PaymentMethod>;
    update(id: string, updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<PaymentMethod>;
    remove(id: string): Promise<PaymentMethod>;
}
export declare class SavePaymentMethodController {
    private readonly paymentMethodService;
    constructor(paymentMethodService: PaymentMethodService);
    savePaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto, user: User): Promise<{
        id: number;
        method_key: string;
        payment_gateway_id: number;
        default_card: boolean;
        fingerprint: string;
        owner_name: string;
        last4: string;
        expires: string;
        network: string;
        type: string;
        origin: string;
        verification_check: any;
        created_at: Date;
        updated_at: Date;
    } & PaymentMethod>;
}
export declare class SetDefaultCardController {
    private readonly paymentMethodService;
    constructor(paymentMethodService: PaymentMethodService);
    setDefaultCard(defaultCart: DefaultCart): Promise<PaymentMethod>;
}

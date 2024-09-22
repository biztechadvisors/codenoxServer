import { Repository } from 'typeorm';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { Refund } from './entities/refund.entity';
import { AnalyticsService } from '../analytics/analytics.service';
import { Shop } from '../shops/entities/shop.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
export declare class RefundsService {
    private readonly analyticsService;
    private readonly refundRepository;
    private readonly shopRepository;
    private readonly orderRepository;
    private readonly userRepository;
    constructor(analyticsService: AnalyticsService, refundRepository: Repository<Refund>, shopRepository: Repository<Shop>, orderRepository: Repository<Order>, userRepository: Repository<User>);
    create(createRefundDto: CreateRefundDto): Promise<Refund>;
    findAll(): Promise<Refund[]>;
    findOne(id: number): Promise<Refund>;
    update(id: number, updateRefundDto: UpdateRefundDto): Promise<Refund>;
    remove(id: number): Promise<void>;
}

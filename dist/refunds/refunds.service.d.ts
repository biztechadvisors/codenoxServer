import { Repository } from 'typeorm';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { Refund } from './entities/refund.entity';
import { AnalyticsService } from '../analytics/analytics.service';
export declare class RefundsService {
    private readonly analyticsService;
    private readonly refundRepository;
    constructor(analyticsService: AnalyticsService, refundRepository: Repository<Refund>);
    create(createRefundDto: CreateRefundDto): Promise<Refund>;
    findAll(): Promise<Refund[]>;
    findOne(id: number): Promise<Refund>;
    update(id: number, updateRefundDto: UpdateRefundDto): Promise<Refund>;
    remove(id: number): Promise<void>;
}

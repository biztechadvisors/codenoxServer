import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { Refund } from './entities/refund.entity';
export declare class RefundsController {
    private readonly refundsService;
    constructor(refundsService: RefundsService);
    create(createRefundDto: CreateRefundDto): Promise<Refund>;
    findAll(): Promise<Refund[]>;
    findOne(id: string): Promise<Refund>;
    update(id: string, updateRefundDto: UpdateRefundDto): Promise<Refund>;
    remove(id: string): Promise<void>;
}

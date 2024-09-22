import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { ApproveWithdrawDto } from './dto/approve-withdraw.dto';
import { Withdraw } from './entities/withdraw.entity';
import { GetWithdrawsDto, WithdrawPaginator } from './dto/get-withdraw.dto';
import { Repository } from 'typeorm';
import { Balance } from '../shops/entities/balance.entity';
import { Shop } from '../shops/entities/shop.entity';
export declare class WithdrawsService {
    private withdrawRepository;
    private balanceRepository;
    private shopRepository;
    constructor(withdrawRepository: Repository<Withdraw>, balanceRepository: Repository<Balance>, shopRepository: Repository<Shop>);
    create(createWithdrawDto: CreateWithdrawDto): Promise<Withdraw | "You Already Have Pending Request">;
    getWithdraws({ limit, page, status, shop_id, }: GetWithdrawsDto): Promise<WithdrawPaginator>;
    findOne(id: number): Promise<Withdraw>;
    update(id: number, updateWithdrawDto: ApproveWithdrawDto): Promise<Withdraw>;
    remove(id: number): Promise<{
        id: number;
    }>;
}

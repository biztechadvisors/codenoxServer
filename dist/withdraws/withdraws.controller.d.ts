import { WithdrawsService } from './withdraws.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { ApproveWithdrawDto } from './dto/approve-withdraw.dto';
import { GetWithdrawsDto, WithdrawPaginator } from './dto/get-withdraw.dto';
export declare class WithdrawsController {
    private readonly withdrawsService;
    constructor(withdrawsService: WithdrawsService);
    createWithdraw(createWithdrawDto: CreateWithdrawDto): Promise<import("./entities/withdraw.entity").Withdraw | "You Already Have Pending Request">;
    withdraws(query: GetWithdrawsDto): Promise<WithdrawPaginator>;
    withdraw(id: string): Promise<import("./entities/withdraw.entity").Withdraw>;
    approveWithdraw(id: string, updateWithdrawDto: ApproveWithdrawDto): Promise<import("./entities/withdraw.entity").Withdraw>;
    deleteWithdraw(id: number): Promise<{
        id: number;
    }>;
}

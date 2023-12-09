import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Withdraw } from "./entities/withdraw.entity";
import { Repository } from "typeorm";

@CustomRepository(Withdraw)
export class WithdrawRepository extends Repository<Withdraw>{}
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { CreateWithdrawDto } from './dto/create-withdraw.dto'
import { ApproveWithdrawDto } from './dto/approve-withdraw.dto'
import { Withdraw, WithdrawStatus } from './entities/withdraw.entity'
import { GetWithdrawsDto, WithdrawPaginator } from './dto/get-withdraw.dto'
import { paginate } from 'src/common/pagination/paginate'
import { WithdrawRepository } from './withdraws.repository'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class WithdrawsService {

  constructor(
    @InjectRepository(Withdraw)
    private withdrawRepository: WithdrawRepository,
  ){}
  private withdraws: Withdraw[] = []

 async create(createWithdrawDto: CreateWithdrawDto) {
 
    const newWithdraw = new Withdraw()

    newWithdraw.amount = createWithdrawDto.amount
    newWithdraw.details = createWithdrawDto.details
    newWithdraw.note = createWithdrawDto.note
    newWithdraw.payment_method = createWithdrawDto.payment_method
    newWithdraw.shop_id = createWithdrawDto.shop_id
    // newWithdraw.status = WithdrawStatus

    const saveWithdraw = await this.withdrawRepository.save(newWithdraw)
          console.log("withdraw", saveWithdraw)
    return {
      // id: this.withdraws.length + 1,
      // ...createWithdrawDto,
      saveWithdraw
    }
  }

  getWithdraws({
    limit,
    page,
    status,
    shop_id,
  }: GetWithdrawsDto): WithdrawPaginator {
    if (!page) page = 1

    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let data: Withdraw[] = this.withdraws
    // if (status) {
    //   data = fuse.search(status)?.map(({ item }) => item);
    // }

    if (shop_id) {
      data = this.withdraws.filter((p) => p.shop_id === shop_id)
    }
    const results = data.slice(startIndex, endIndex)
    const url = `/withdraws?limit=${limit}`

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} withdraw`
  }

  update(id: number, updateWithdrawDto: ApproveWithdrawDto) {
    return this.withdraws[0]
  }

  remove(id: number) {
    return `This action removes a #${id} withdraw`
  }
}

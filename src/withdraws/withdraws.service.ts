import { Injectable } from '@nestjs/common'
import { CreateWithdrawDto } from './dto/create-withdraw.dto'
import { ApproveWithdrawDto } from './dto/approve-withdraw.dto'
import { Withdraw, WithdrawStatus } from './entities/withdraw.entity'
import { GetWithdrawsDto, WithdrawPaginator } from './dto/get-withdraw.dto'
import { paginate } from 'src/common/pagination/paginate'
import { InjectRepository } from '@nestjs/typeorm'
import { WithdrawRepository } from './withdraws.repository'
import Fuse from 'fuse.js'
import { Balance } from 'src/shops/entities/balance.entity'
import { BalanceRepository } from 'src/shops/shops.repository'

@Injectable()
export class WithdrawsService {
  constructor(
    @InjectRepository(WithdrawRepository)
    private withdrawRepository: WithdrawRepository,
    @InjectRepository(BalanceRepository)
    private balanceRepository: BalanceRepository,
  ){}
  private withdraws: Withdraw[] = []

 async create(createWithdrawDto: CreateWithdrawDto) {
    const newWithdraw = new Withdraw()
    const newWithdrawBalance = new Balance()

    newWithdraw.amount = createWithdrawDto.amount
    newWithdraw.details = createWithdrawDto.details
    newWithdraw.note = createWithdrawDto.note
    newWithdraw.payment_method = createWithdrawDto.payment_method
    newWithdraw.shop_id = createWithdrawDto.shop_id
    newWithdraw.status = WithdrawStatus.PENDING
    // newWithdraw.shop = shop_id

    const addWithdraw = await this.withdrawRepository.save(newWithdraw)
console.log("data",addWithdraw)
    const findBalanceId = await this.balanceRepository.findOne({
      where: {
        id: addWithdraw.shop.balance.id
      }
    })
    console.log("id",findBalanceId)
    if(findBalanceId){
    newWithdrawBalance.withdrawn_amount = addWithdraw.amount
    const addWithdraBalance = await this.balanceRepository.save(newWithdrawBalance)
   console.log("updatedWithdraw",addWithdraBalance)
     }
      console.log("add data", addWithdraw)
    return addWithdraw
    
  }

  async getWithdraws({
    limit,
    page,
    status,
    shop_id,
  }: GetWithdrawsDto): Promise<WithdrawPaginator> {
    if (!page) page = 1;
  
   
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    let data: Withdraw[] = await this.withdrawRepository.find({
      relations: ['shop'],
    });
  
    const fuse = new Fuse(data, {
      keys: ['name', 'shop_id', 'status'],
      threshold: 0.2, 
    });


    if (status) {
      // Assuming you have a search function like fuse.search
      const fuseSearchResult = fuse.search(status);
      data = fuseSearchResult?.map(({ item }) => item) || [];
      console.log("search", data)
    }
  
    // console.log("first", data);
  
    if (shop_id) {
      
      data = await this.withdrawRepository.find({
        where: {
          shop_id: shop_id
        },
        relations: ['shop']
      });
console.log("find",data)
    }
    console.log("data", data)
    const results = data.slice(startIndex, endIndex);
    const url = `/withdraws?limit=${limit}`;
  console.log("result", results)
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }
  

 async findOne(id: number) {
    console.log("id",id)
    const getWthdraw = await this.withdrawRepository.findOne({
      where: {shop_id: id},
      relations: ['shop']
    })

    console.log("withdrawe=sssssss", getWthdraw)

    return getWthdraw
  }

 async update(id: number, updateWithdrawDto: ApproveWithdrawDto) {

    const findWithdraw = await this.withdrawRepository.find({
      where: {
        shop_id: id, 
        status: updateWithdrawDto.status,
      }
    })
    console.log("findWitdraw", findWithdraw)

    return this.withdraws[0]
  }

  remove(id: number) {
    return `This action removes a #${id} withdraw`
  }
}

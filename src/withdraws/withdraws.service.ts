/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { CreateWithdrawDto } from './dto/create-withdraw.dto'
import { ApproveWithdrawDto } from './dto/approve-withdraw.dto'
import { Withdraw, WithdrawStatus } from './entities/withdraw.entity'
import { GetWithdrawsDto, WithdrawPaginator } from './dto/get-withdraw.dto'
import { paginate } from 'src/common/pagination/paginate'
import { InjectRepository } from '@nestjs/typeorm'
import { WithdrawRepository } from './withdraws.repository'
import Fuse from 'fuse.js'
// import { Balance } from 'src/shops/entities/balance.entity'
import { BalanceRepository, ShopRepository } from 'src/shops/shops.repository'

@Injectable()
export class WithdrawsService {
  constructor(
    @InjectRepository(WithdrawRepository)
    private withdrawRepository: WithdrawRepository,
    @InjectRepository(BalanceRepository)
    private balanceRepository: BalanceRepository,
    @InjectRepository(ShopRepository)
    private shopRepository:ShopRepository,
  ){}
  private withdraw: Withdraw[] = []

 async create(createWithdrawDto: CreateWithdrawDto) {
    const newWithdraw = new Withdraw()
    // const newWithdrawBalance = new Balance()

    try{

     const findId = await this.withdrawRepository.find({
      where: {
        shop_id: createWithdrawDto.shop_id
      }
     })

     console.log("findShop", findId)
     if(!findId){

    newWithdraw.amount = createWithdrawDto.amount
    newWithdraw.details = createWithdrawDto.details
    newWithdraw.note = createWithdrawDto.note
    newWithdraw.payment_method = createWithdrawDto.payment_method
    newWithdraw.shop_id = createWithdrawDto.shop_id
    newWithdraw.status = WithdrawStatus.PROCESSING  
    newWithdraw.createdAt = new Date()
    newWithdraw.updatedAt = new Date()

     const shop = await this.shopRepository.findOne({
    where: {
      id: createWithdrawDto.shop_id,
    },
    relations: ['balance'],
  });
  console.log("shopId", shop)
 
  newWithdraw.shop = shop

    const addWithdraw = await this.withdrawRepository.save(newWithdraw)
  console.log("data",addWithdraw)
    const findBalanceId = await this.balanceRepository.findOne({
      where: {
        id: addWithdraw.shop.balance.id
      }
    })
    console.log("id",findBalanceId)
    if(findBalanceId){

    findBalanceId.withdrawn_amount = addWithdraw.amount
    const addWithdraBalance = await this.balanceRepository.save(findBalanceId)
    console.log("updatedWithdraw",addWithdraBalance)
     }
      console.log("add data", addWithdraw)
    return addWithdraw
  } else {
    console.log("Already have pending Request")
    return 'You Already Have Pending Request'
  }
    }catch(error){
      console.log(error)
    }
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
      threshold: 0.3, 
    });


    if (status) {
    
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
      where: {id: id},
      relations: ['shop']
    })

    console.log("withdrawe=sssssss", getWthdraw)

    return getWthdraw
  }

 async update(id: number, updateWithdrawDto: ApproveWithdrawDto) {
  console.log("change", updateWithdrawDto)
    const findWithdraw = await this.withdrawRepository.findOne({
      where: {
        id: updateWithdrawDto.id, 
        // status: updateWithdrawDto.status,
      },
      relations: [
        'shop',   
    ]
    })

    // console.log("findwithdraw++++++++++++", findWithdraw.status)
    findWithdraw.status = updateWithdrawDto.status
    // console.log("inserted Status",findWithdraw.status)
    // console.log("already have status",WithdrawStatus.APPROVED)

    // console.log(findWithdraw.status === WithdrawStatus.APPROVED)

     if(findWithdraw.status === WithdrawStatus.APPROVED){
      const shop = await this.shopRepository.findOne({
        where: {
          id: findWithdraw.shop.id,
        },
        relations: ['balance'],
      });

      const balance = await this.balanceRepository.findOne({
        where: {
          id: shop.balance.id
        }
      })

      console.log("shopId", shop)
      console.log("balance", shop.balance.current_balance)

      balance.current_balance -=  findWithdraw.amount

       console.log("blance", shop.balance.current_balance)

     const final = await this.balanceRepository.save(balance)

       console.log("final",final)
      }

    const updatedStatus = await this.withdrawRepository.save(findWithdraw)

    return updatedStatus
  }

  async remove(id: number) {
    // Find the Withdraw object with the given id
    const idFind = await this.withdrawRepository.findOne({
      where: {
        id: id
      }
    })
    // Check if the object exists
    if (!idFind) {
      // Throw an error if the object is not found
      throw new Error(`Withdraw with ID ${id} not found`)
    }
    // Create a new object with only the ID
    const deleteData = {
      id: idFind.id
    }
    // Use `delete` with the filtered data object
    await this.withdrawRepository.delete(deleteData)
    // Log the deleted data
    console.log("0", deleteData)
    // Return the deleted data (optional)
    return deleteData
  }
  
}

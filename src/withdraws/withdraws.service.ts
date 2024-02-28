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
    private shopRepository: ShopRepository,
  ) { }
 
  async create(createWithdrawDto: CreateWithdrawDto) {
    const newWithdraw = new Withdraw()
    // const newWithdrawBalance = new Balance()

    try {
      const findId = await this.withdrawRepository.find({
        where: {
          shop_id: createWithdrawDto.shop_id
        }
      })

      if (findId) {

        newWithdraw.amount = createWithdrawDto.amount
        newWithdraw.details = createWithdrawDto.details
        newWithdraw.note = createWithdrawDto.note
        newWithdraw.payment_method = createWithdrawDto.payment_method
        newWithdraw.shop_id = createWithdrawDto.shop_id
        newWithdraw.status = WithdrawStatus.PROCESSING
        newWithdraw.created_at = new Date()
        newWithdraw.updated_at = new Date()

        const shop = await this.shopRepository.findOne({
          where: {
            id: createWithdrawDto.shop_id,
          },
          relations: ['balance'],
        });

        newWithdraw.shop = shop

        const addWithdraw = await this.withdrawRepository.save(newWithdraw)

        const findBalanceId = await this.balanceRepository.findOne({
          where: {
            id: addWithdraw.shop.balance.id
          }
        })

        if (findBalanceId) {

          findBalanceId.withdrawn_amount = addWithdraw.amount
            await this.balanceRepository.save(findBalanceId)
        }

        return addWithdraw
      } else {
        return 'You Already Have Pending Request'
      }
    } catch (error) {
      console.error(error)
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

    }

    if (shop_id) {

      data = await this.withdrawRepository.find({
        where: {
          shop_id: shop_id
        },
        relations: ['shop']
      });
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/withdraws?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }


  async findOne(id: number) {

    const getWthdraw = await this.withdrawRepository.findOne({
      where: { id: id },
      relations: ['shop']
    })

    return getWthdraw
  }

  async update(id: number, updateWithdrawDto: ApproveWithdrawDto) {

    const findWithdraw = await this.withdrawRepository.findOne({
      where: {
        id: updateWithdrawDto.id,
        // status: updateWithdrawDto.status,
      },
      relations: [
        'shop',
      ]
    })


    findWithdraw.status = updateWithdrawDto.status

    if (findWithdraw.status === WithdrawStatus.APPROVED) {
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

      balance.current_balance -= findWithdraw.amount

      const final = await this.balanceRepository.save(balance)

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

    if (!idFind) {

      throw new Error(`Withdraw with ID ${id} not found`)
    }

    const deleteData = {
      id: idFind.id
    }

    await this.withdrawRepository.delete(deleteData)

    return deleteData
  }

}
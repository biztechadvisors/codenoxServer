/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger'
import { Balance } from '../entities/balance.entity'


export class CreateBalanceDto extends PickType(Balance, [
 'admin_commission_rate',
 'total_earnings',
 'withdrawn_amount',
 'current_balance',
]){}
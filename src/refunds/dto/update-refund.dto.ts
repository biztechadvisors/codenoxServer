/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/swagger'
import { CreateRefundDto } from './create-refund.dto'

export class UpdateRefundDto extends PartialType(CreateRefundDto) {}

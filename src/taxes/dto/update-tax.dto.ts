/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/swagger'
import { CreateTaxDto } from './create-tax.dto'

export class UpdateTaxDto extends PartialType(CreateTaxDto) {}

/* eslint-disable prettier/prettier */
import { OmitType } from '@nestjs/swagger';
import { Tax } from '../entities/tax.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaxDto extends OmitType(Tax, [
  'id',
  'created_at',
  'updated_at',
]) {}

export class ValidateGstDto {
  @IsNotEmpty()
  @IsString()
  gstNumber: string;
}
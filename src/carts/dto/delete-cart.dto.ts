/* eslint-disable prettier/prettier */

import { IsEmail } from 'class-validator';

export class ClearCartDto {
  @IsEmail()
  email: string;
}

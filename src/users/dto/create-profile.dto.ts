/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger';
import { Profile } from '../entities/profile.entity';

export class CreateProfileDto extends PickType(Profile, [
  'avatar',
  'bio',
  // 'socials',
  'contact',
  'customer'
]) {
  // customer: number;
}

// export class ConnectBelongsTo {
//   connect: number;
// }

export class CreateSocialDto {
  type: string;
  link: string;
  profile:Profile
}
/* eslint-disable prettier/prettier */
<<<<<<< HEAD
import { PickType } from '@nestjs/swagger';
import { Profile } from '../entities/profile.entity';
=======
import { PickType } from '@nestjs/swagger'
import { Profile } from '../entities/profile.entity'
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

export class CreateProfileDto extends PickType(Profile, [
  'avatar',
  'bio',
  // 'socials',
  'contact',
  'customer'
]) {
<<<<<<< HEAD
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
=======
  customer: ConnectBelongsTo
}

export class ConnectBelongsTo {
  connect: number
}
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

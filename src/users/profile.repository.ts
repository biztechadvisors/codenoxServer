/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator';

@CustomRepository(Profile)
export class ProfileRepository extends Repository<Profile> {}
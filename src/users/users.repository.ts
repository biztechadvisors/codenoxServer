/* eslint-disable prettier/prettier */
import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { Social } from "./entities/profile.entity";

@CustomRepository(User)
export class UserRepository extends Repository<User> { }

@CustomRepository(Social)
export class SocialRepository extends Repository<Social>{ }
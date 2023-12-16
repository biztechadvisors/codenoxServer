import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { Profile, Social } from "./entities/profile.entity";
import { Dealer, DealerCategoryMargin, DealerProductMargin } from "./entities/dealer.entity";

@CustomRepository(User)
export class UserRepository extends Repository<User> { }

@CustomRepository(Profile)
export class ProfileRepository extends Repository<Profile> { }

@CustomRepository(Dealer)
export class DealerRepository extends Repository<Dealer> { }

@CustomRepository(DealerProductMargin)
export class DealerProductMarginRepository extends Repository<DealerProductMargin> { }


@CustomRepository(DealerCategoryMargin)
export class DealerCategoryMarginRepository extends Repository<DealerCategoryMargin> { }

@CustomRepository(Social)
export class SocialRepository extends Repository<Social> { }
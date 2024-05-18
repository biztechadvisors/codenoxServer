/* eslint-disable prettier/prettier */
import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { Profile, Social } from "./entities/profile.entity";
import { Dealer, DealerCategoryMargin, DealerProductMargin } from "./entities/dealer.entity";

@CustomRepository(User)
export class UserRepository extends Repository<User> {
    async findById(id: any): Promise<User | undefined> {
        return await this.findOne(id);
    }

    async findAll(): Promise<User[]> {
        return await this.find();
    }

    async findByNameOrEmail(text: string): Promise<User[]> {
        return await this.createQueryBuilder('user')
            .where('user.name LIKE :text OR user.email LIKE :text', { text: `%${text}%` })
            .getMany();
    }
}

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
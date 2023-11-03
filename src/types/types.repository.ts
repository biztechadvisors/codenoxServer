import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { Type, TypeSettings, Banner } from "./entities/type.entity";


@CustomRepository(Type)
export class TypeRepository extends Repository<Type> { }

@CustomRepository(Type)
export class TypeSettingsRepository extends Repository<TypeSettings> { }

@CustomRepository(Banner)
export class BannerRepoditory extends Repository<BannerRepoditory>{ }
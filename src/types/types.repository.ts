/* eslint-disable prettier/prettier */
import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { Type, TypeSettings, Banner } from "./entities/type.entity";

// repositories.ts
@CustomRepository(Type)
export class TypeRepository extends Repository<Type> {}

@CustomRepository(TypeSettings)
export class TypeSettingsRepository extends Repository<TypeSettings> {}

@CustomRepository(Banner)
export class BannerRepository extends Repository<Banner> {}

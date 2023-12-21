import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Shop } from "./entities/shop.entity";
import { Repository } from "typeorm";

@CustomRepository(Shop)
export class ShopRepository extends Repository<Shop> { }

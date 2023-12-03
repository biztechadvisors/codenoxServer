/* eslint-disable prettier/prettier */
import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { Coupon } from "./entities/coupon.entity";


@CustomRepository(Coupon)
export class CouponRepository extends Repository<Coupon>{}
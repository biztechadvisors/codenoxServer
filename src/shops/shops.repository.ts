/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator';
import { PaymentInfo, Shop } from './entities/shop.entity';
import { ShopSettings } from './entities/shopSettings.entity';
import { Balance } from './entities/balance.entity';
import { UserAddress } from 'src/addresses/entities/address.entity';
import { Location, ShopSocials } from 'src/settings/entities/setting.entity';

@CustomRepository(Shop)
export class ShopRepository extends Repository<Shop> {
    // isEntityChanged(newShop: Shop) {
    //     throw new Error('Method not implemented.');
    // }
}

@CustomRepository(PaymentInfo)
export class PaymentInfoRepository extends Repository<PaymentInfo> {}

@CustomRepository(ShopSettings)
export class ShopSettingsRepository extends Repository<ShopSettings> {}

@CustomRepository(Balance)
export class BalanceRepository extends Repository<Balance> {}

@CustomRepository(UserAddress)
export class AddressRepository extends Repository<UserAddress> {}

@CustomRepository(ShopSocials)
export class ShopSocialsRepository extends Repository<ShopSocials> {}

@CustomRepository(Location)
export class LocationRepository extends Repository<Location> {}

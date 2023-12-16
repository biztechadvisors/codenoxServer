import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DealerController, ProfilesController, UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealerCategoryMarginRepository, DealerProductMarginRepository, DealerRepository, SocialRepository, UserRepository } from './users.repository';
import { AddressRepository } from 'src/addresses/addresses.repository';
import { ProfileRepository } from './profile.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { AttachmentRepository } from 'src/common/common.repository';
import { User } from './entities/user.entity';
import { Profile, Social } from './entities/profile.entity';
import { Dealer, DealerCategoryMargin, DealerProductMargin } from './entities/dealer.entity';
import { CategoryRepository } from 'src/categories/categories.repository';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Address } from 'src/addresses/entities/address.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { ShopRepository } from 'src/shops/shops.repository';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([UserRepository, AddressRepository, ProfileRepository, AttachmentRepository, DealerRepository, ProfileRepository, CategoryRepository, AddressRepository, DealerProductMarginRepository, SocialRepository, DealerCategoryMarginRepository, ShopRepository]),
    TypeOrmModule.forFeature([User, Profile, Dealer, Social, Product, Category, Address, Attachment, DealerCategoryMargin, DealerProductMargin, Shop])
  ],
  controllers: [UsersController, ProfilesController, DealerController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }

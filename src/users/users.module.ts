import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DealerController, ProfilesController, UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealerCategoryMarginRepository, DealerProductMarginRepository, DealerRepository, UserRepository } from './users.repository';
import { AddressRepository } from 'src/addresses/addresses.repository';
import { ProfileRepository } from './profile.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { AttachmentRepository } from 'src/common/common.repository';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Dealer, DealerCategoryMargin, DealerProductMargin } from './entities/dealer.entity';
import { CategoryRepository } from 'src/categories/categories.repository';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Address } from 'src/addresses/entities/address.entity';
import { Attachment } from 'src/common/entities/attachment.entity';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([UserRepository, AddressRepository, ProfileRepository, AttachmentRepository, DealerRepository, ProfileRepository, CategoryRepository, AddressRepository, DealerProductMarginRepository, DealerCategoryMarginRepository]),
    TypeOrmModule.forFeature([User, Profile, Dealer, Product, Category, Address, Attachment, DealerCategoryMargin, DealerProductMargin])
  ],
  controllers: [UsersController, ProfilesController, DealerController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }

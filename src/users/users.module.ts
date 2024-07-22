import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DealerController, ProfilesController, UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealerCategoryMarginRepository, DealerProductMarginRepository, DealerRepository, SocialRepository, UserRepository } from './users.repository';
import { AddressRepository, UserAddressRepository } from 'src/addresses/addresses.repository';
import { ProfileRepository } from './profile.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { AttachmentRepository } from 'src/common/common.repository';
import { User } from './entities/user.entity';
import { Profile, Social } from './entities/profile.entity';
import { Dealer, DealerCategoryMargin, DealerProductMargin } from './entities/dealer.entity';
import { CategoryRepository } from 'src/categories/categories.repository';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { ShopRepository } from 'src/shops/shops.repository';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';
import { AddressesService } from 'src/addresses/addresses.service';
import { Address, UserAddress } from 'src/addresses/entities/address.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from 'src/notifications/notifications.module'; // Ensure this is imported

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      UserRepository, UserAddressRepository, ProfileRepository, AttachmentRepository,
      DealerRepository, CategoryRepository, DealerProductMarginRepository,
      SocialRepository, DealerCategoryMarginRepository, ShopRepository, AddressRepository
    ]),
    TypeOrmModule.forFeature([
      User, Address, UserAddress, Profile, Dealer, Social, Product, Category,
      Attachment, DealerCategoryMargin, DealerProductMargin, Shop, Permission
    ]),
    JwtModule.register({}), // Register JwtModule with default settings or specific configuration
    NotificationModule // Import NotificationModule to provide NotificationService
  ],
  controllers: [UsersController, ProfilesController, DealerController],
  providers: [UsersService, AuthService, MailService, AddressesService, JwtStrategy],
  exports: [UsersService], // Export UsersService if needed by other modules
})
export class UsersModule { }

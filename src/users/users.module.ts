import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DealerController, ProfilesController, UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile, Social } from './entities/profile.entity';
import { Dealer, DealerCategoryMargin, DealerProductMargin } from './entities/dealer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';
import { Permission } from 'src/permission/entities/permission.entity';
import { JwtStrategy } from '@db/src/auth/auth-helper/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from 'src/notifications/notifications.module'; // Ensure this is imported
import { CacheModule } from '@nestjs/cache-manager';
import { SessionService } from '../auth/auth-helper/session.service';
import { Add, UserAdd } from '../address/entities/address.entity';
import { AddressesService } from '../address/addresses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, Add, UserAdd, Profile, Dealer, Social, Product, Category,
      Attachment, DealerCategoryMargin, DealerProductMargin, Shop, Permission
    ]),
    JwtModule.register({}),
    CacheModule.register(),
    NotificationModule,
  ],
  controllers: [UsersController, ProfilesController, DealerController],
  providers: [UsersService, AuthService, MailService, AddressesService, JwtStrategy, SessionService],
  exports: [UsersService],
})
export class UsersModule { }

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from 'src/users/users.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth-helper/constants';
import { MailModule } from 'src/mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import { User } from 'src/users/entities/user.entity';
import { JwtStrategy } from './auth-helper/jwt.strategy';
import { NotificationModule } from 'src/notifications/notifications.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PermissionRepository } from '../permission/permission.repository';
import { SessionService } from './auth-helper/session.service';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([UserRepository, PermissionRepository]),
    TypeOrmModule.forFeature([Permission, User]),
    UsersModule,
    MailModule,
    NotificationModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '4m' },
    }),
    CacheModule.register()
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SessionService],
  exports: [AuthService],
})
export class AuthModule { }

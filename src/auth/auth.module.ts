import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { NotificationModule } from 'src/notifications/notifications.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UserRepository } from 'src/users/users.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { PermissionRepository } from '../permission/permission.repository';
import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { JwtStrategy } from './auth-helper/jwt.strategy';
import { SessionService } from './auth-helper/session.service';
import { UsersModule } from '../users/users.module';

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
    CacheModule.register(),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SessionService],
  exports: [AuthService],
})
export class AuthModule { }

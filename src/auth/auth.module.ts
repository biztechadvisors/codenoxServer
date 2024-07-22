import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from 'src/users/users.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { MailModule } from 'src/mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import { User } from 'src/users/entities/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { NotificationModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([UserRepository]),
    TypeOrmModule.forFeature([Permission, User]),
    UsersModule,
    MailModule,
    NotificationModule, // Import NotificationModule to provide NotificationService
    JwtModule.register({
      global: true,
      secret: jwtConstants.access_secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule { }

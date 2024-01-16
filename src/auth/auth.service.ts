/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  AuthResponse,
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  CoreResponse,
  RegisterDto,
  ResetPasswordDto,
  VerifyForgetPasswordDto,
  SocialLoginDto,
  OtpLoginDto,
  OtpResponse,
  VerifyOtpDto,
  OtpDto,
} from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import usersJson from '@db/users.json';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/users.repository';
const users = plainToClass(User, usersJson);
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    @InjectRepository(Permission) private permissionRepository:Repository<Permission>,
    private jwtService: JwtService,
    private mailService: MailService
  ) { }

  private users: User[] = users;

  async generateOtp(): Promise<number> {
    const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    return otp;
  }

  async destroyOtp(otp: number, createdAt: Date): Promise<void> {
    const user = await this.userRepository.findOne({ where: { otp, createdAt } });
    if (!user) {
      return;
    }
    // Destroy the OTP.
    user.otp = null;
    user.createdAt = null;
    await this.userRepository.save(user);
  }

  async verifyOtp(otp: number): Promise<{ status: boolean } | { message: string } | boolean> {
    // Check if the OTP exists.
    const user = await this.userRepository.findOne({ where: { otp } });
    if (!user) {
      return false;
    }
    // Check if the OTP is older than 1 minute.
    const otpCreatedAt = new Date(user.createdAt);
    const now = new Date();
    const elapsedTime = now.getTime() - otpCreatedAt.getTime();
    const oneMinuteInMilliseconds = 60 * 1000;
    if (elapsedTime > oneMinuteInMilliseconds) {
      // Destroy the OTP.
      await this.destroyOtp(otp, otpCreatedAt);
      // Prompt the user to request a new OTP.
      return {
        status: false,
        message: "Please request a new OTP."
      };
    }
    // Verify the OTP.
    if (user.otp !== otp) {
      return false;
    }
    // Set the user's account as verified.
    user.isVerified = true;
    user.otp = null
    await this.userRepository.save(user);
    return true;
  }

  async signIn(email, pass) {
    console.log("SignIn")
    const user = await this.userRepository.findOne({ where: { email: email } });
    const isMatch = await bcrypt.compare(pass, user.password);

    if (isMatch) {
      // The password is correct.
      const payload = { sub: user.id, username: user.name };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } else {
      throw new UnauthorizedException();
    }
  }

  async register(createUserInput: RegisterDto): Promise<{ message: string; } | AuthResponse> {

    const emailExist = await this.userRepository.findOne({
      where: { email: createUserInput.email },
    });
    if (emailExist) {
      const otp = await this.generateOtp();
      const token = Math.floor(100 + Math.random() * 900).toString();
      emailExist.otp = otp;
      emailExist.createdAt = new Date();
      await this.userRepository.save(emailExist);

      await this.mailService.sendUserConfirmation(emailExist, token);
      return {
        message: 'OTP sent to your email.',
      };
    }

    const otp = await this.generateOtp();
    const token = Math.floor(100 + Math.random() * 900).toString();

    const hashPass = await bcrypt.hash(createUserInput.password, 12);
    const userData = new User();
    userData.name = createUserInput.name;
    userData.email = createUserInput.email;
    userData.password = hashPass;
    userData.otp = otp;
    userData.createdAt = new Date();

    await this.userRepository.save(userData);
    await this.mailService.sendUserConfirmation(userData, token);

    const access_token = await this.signIn(createUserInput.email, createUserInput.password);
    const result = await this.permissionRepository
    .createQueryBuilder('permission')
    .leftJoinAndSelect('permission.permissions', 'permissions')
    .where(`permission.id = ${6}`)
    .select([
      'permission.id',
      'permission.type_name',
      'permissions.id',
      'permissions.type',
      'permissions.read',
      'permissions.write',
    ])
    .getMany();

    console.log('result')
    console.log(result)

  const formattedResult = result.map(permission => ({
    id: permission.id,
    type_name: permission.type_name,
    permission: permission.permissions.map(p => ({
      id: p.id,
      type: p.type,
      read: p.read,
      write: p.write,
    })),
  }));

  console.log(formattedResult[0])
    return {
      token: access_token.access_token,
      type_name: [`${formattedResult[0].type_name}`],
      permissions:  formattedResult[0].permission
    };
  }

  // async login(loginInput: LoginDto): Promise<{ message: string; } | AuthResponse> {

  //   const user = await this.userRepository.findOne({ where: { email: loginInput.email } })

  //   console.log("Login")
  //   if (!user || !user.isVerified) {
  //     return {
  //       message: 'User Is Not Regesired !'
  //     }
  //   }

  //   const access_token = await this.signIn(loginInput.email, loginInput.password)

  //   console.log("access_token", access_token)
  //   if (loginInput.email === 'store_owner@demo.com') {
  //     return {
  //       token: access_token.access_token,
  //       permissions: ['store_owner', 'customer'],
  //     };
  //   } else {
  //     return {
  //       token: access_token.access_token,
  //       permissions: ['super_admin', 'customer'],
  //     };
  //   }
  // }

  async login(loginInput: LoginDto): Promise<{ message: string; } | AuthResponse> {

    const user = await this.userRepository.findOne({ where: { email: loginInput.email } })

    console.log("Login")
    if (!user || !user.isVerified) {
      return {
        message: 'User Is Not Regesired !'
      }
    }

    const access_token = await this.signIn(loginInput.email, loginInput.password)

    console.log("access_token", access_token)
    const result = await this.permissionRepository
          .createQueryBuilder('permission')
          .leftJoinAndSelect('permission.permissions', 'permissions')
          .where(`permission.id = ${6}`)
          .select([
            'permission.id',
            'permission.type_name',
            'permissions.id',
            'permissions.type',
            'permissions.read',
            'permissions.write',
          ])
          .getMany();

          console.log('result')
          console.log(result)
      
        const formattedResult = result.map(permission => ({
          id: permission.id,
          type_name: permission.type_name,
          permission: permission.permissions.map(p => ({
            id: p.id,
            type: p.type,
            read: p.read,
            write: p.write,
          })),
        }));

        console.log(formattedResult[0].type_name)
    if (loginInput.email === 'store_owner@demo.com') {
      return {
        token: access_token.access_token,
        type_name: [`${formattedResult[0].type_name[0]}`,`${formattedResult[0].type_name}`],
        permissions:  formattedResult[0].permission
      };
    } else {
      return {
        token: access_token.access_token,
        type_name: [`${formattedResult[0].type_name}`],
        permissions:  formattedResult[0].permission //['super_admin', 'customer'],
      };
    }
  }

  async changePassword(
    changePasswordInput: ChangePasswordDto,
  ): Promise<{ message: string } | CoreResponse> {
    console.log(changePasswordInput);

    const user = await this.userRepository.findOne({ where: { email: changePasswordInput.email } })

    if (!user) {
      return {
        message: "User Email is InValid"
      }
    }

    const isMatch = await bcrypt.compare(changePasswordInput.oldPassword, user.password);

    if (!isMatch) {
      // The old password is incorrect.
      return {
        success: false,
        message: 'Old password is incorrect',
      };
    }

    const hashPass = await bcrypt.hash(changePasswordInput.newPassword, 12);
    user.password = hashPass;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Password change successful',
    };
  }

  async forgetPassword(
    forgetPasswordInput: ForgetPasswordDto,
  ): Promise<{ message: string } | CoreResponse> {
    console.log(forgetPasswordInput);

    const user = await this.userRepository.findOne({ where: { email: forgetPasswordInput.email } })
    if (!user) {
      return {
        message: "User Email is InValid"
      }
    }

    if (user) {
      const otp = await this.generateOtp();
      const token = Math.floor(100 + Math.random() * 900).toString();
      user.otp = otp;
      user.createdAt = new Date();
      await this.userRepository.save(user);

      await this.mailService.sendUserConfirmation(user, token);
      return {
        success: true,
        message: 'OTP sent to your email.',
      };
    }
    // return {
    //   success: true,
    //   message: 'Password change successful',
    // };
  }

  async verifyForgetPasswordToken(
    verifyForgetPasswordTokenInput: VerifyForgetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(verifyForgetPasswordTokenInput);

    return {
      success: true,
      message: 'Password change successful',
    };
  }
  async resetPassword(
    resetPasswordInput: ResetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(resetPasswordInput);

    return {
      success: true,
      message: 'Password change successful',
    };
  }
  async socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponse> {
    console.log(socialLoginDto);
    const result = await this.permissionRepository
    .createQueryBuilder('permission')
    .leftJoinAndSelect('permission.permissions', 'permissions')
    .where(`permission.id = ${6}`)
    .select([
      'permission.id',
      'permission.type_name',
      'permissions.id',
      'permissions.type',
      'permissions.read',
      'permissions.write',
    ])
    .getMany();

    console.log('result')
    console.log(result)

  const formattedResult = result.map(permission => ({
    id: permission.id,
    type_name: permission.type_name,
    permission: permission.permissions.map(p => ({
      id: p.id,
      type: p.type,
      read: p.read,
      write: p.write,
    })),
  }));

  console.log(formattedResult[0])
    return {
      token: 'jwt token',
      type_name: [`${formattedResult[0].type_name}`],
      permissions:  formattedResult[0].permission
    };
  }
  async otpLogin(otpLoginDto: OtpLoginDto): Promise<AuthResponse> {
    console.log(otpLoginDto);
    const result = await this.permissionRepository
    .createQueryBuilder('permission')
    .leftJoinAndSelect('permission.permissions', 'permissions')
    .where(`permission.id = ${6}`)
    .select([
      'permission.id',
      'permission.type_name',
      'permissions.id',
      'permissions.type',
      'permissions.read',
      'permissions.write',
    ])
    .getMany();

    console.log('result')
    console.log(result)

  const formattedResult = result.map(permission => ({
    id: permission.id,
    type_name: permission.type_name,
    permission: permission.permissions.map(p => ({
      id: p.id,
      type: p.type,
      read: p.read,
      write: p.write,
    })),
  }));

  console.log(formattedResult[0])
    return {
      token: 'jwt token',
      type_name: [`${formattedResult[0].type_name}`],
      permissions:  formattedResult[0].permission
    };
  }
  async verifyOtpCode(verifyOtpInput: VerifyOtpDto): Promise<CoreResponse> {
    console.log(verifyOtpInput);
    return {
      message: 'success',
      success: true,
    };
  }
  async sendOtpCode(otpInput: OtpDto): Promise<OtpResponse> {
    console.log(otpInput);
    return {
      message: 'success',
      success: true,
      id: '1',
      provider: 'google',
      phone_number: '+919494949494',
      is_contact_exist: true,
    };
  }

  // async getUsers({ text, first, page }: GetUsersArgs): Promise<UserPaginator> {
  //   const startIndex = (page - 1) * first;
  //   const endIndex = page * first;
  //   let data: User[] = this.users;
  //   if (text?.replace(/%/g, '')) {
  //     data = fuse.search(text)?.map(({ item }) => item);
  //   }
  //   const results = data.slice(startIndex, endIndex);
  //   return {
  //     data: results,
  //     paginatorInfo: paginate(data.length, page, first, results.length),
  //   };
  // }
  // public getUser(getUserArgs: GetUserArgs): User {
  //   return this.users.find((user) => user.id === getUserArgs.id);
  // }
  me(): User {
    return this.users[0];
  }

  // updateUser(id: number, updateUserInput: UpdateUserInput) {
  //   return `This action updates a #${id} user`;
  // }
}
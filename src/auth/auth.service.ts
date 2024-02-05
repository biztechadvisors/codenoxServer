/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { User, UserType } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';

@Injectable()
export class AuthService {
  save(user: User) {
    throw new Error('Method not implemented.');
  }

  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    @InjectRepository(Permission) private permissionRepository: Repository<Permission>,
    private jwtService: JwtService,
    private mailService: MailService
  ) { }

  async generateOtp(): Promise<number> {
    const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    return otp;
  }

  async destroyOtp(otp: number, created_at: Date): Promise<void> {
    const user = await this.userRepository.findOne({ where: { otp, created_at } });
    if (!user) {
      return;
    }
    // Destroy the OTP.
    user.otp = null;
    user.created_at = null;
    await this.userRepository.save(user);
  }

  async verifyOtp(otp: number): Promise<{ status: boolean } | { message: string } | boolean> {
    // Check if the OTP exists.
    const user = await this.userRepository.findOne({ where: { otp } });
    if (!user) {
      return false;
    }
    // Check if the OTP is older than 1 minute.
    const otpCreatedAt = new Date(user.created_at);
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
    const user = await this.userRepository.findOne({ where: { email: email, isVerified: true } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }
    // The password is correct.
    const payload = { sub: user.id, username: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }


  async register(createUserInput: RegisterDto): Promise<{ message: string; } | AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserInput.email },
    });

    if (existingUser) {
      const otp = await this.generateOtp();
      const token = Math.floor(100 + Math.random() * 900).toString();

      existingUser.otp = otp;
      existingUser.created_at = new Date();

      await this.userRepository.save(existingUser);

      if (existingUser.type === UserType.Customer) {
        // Send confirmation email for customers
        await this.mailService.sendUserConfirmation(existingUser, token);
      }

      return {
        message: 'OTP sent to your email.',
      };
    }

    const hashPass = await bcrypt.hash(createUserInput.password, 12);
    const userData = new User();
    userData.name = createUserInput.name;
    userData.email = createUserInput.email;
    userData.password = hashPass;
    userData.type = createUserInput.type || UserType.Customer; // Use specified type or default to UserType.Customer
    userData.created_at = new Date();
    userData.UsrBy = createUserInput.UsrBy; // Save the registerer who is registering it

    if (userData.type !== UserType.Customer) {
      userData.isVerified = true;
    }

    await this.userRepository.save(userData);

    if (userData.type === UserType.Customer) {
      const token = Math.floor(100 + Math.random() * 900).toString();
      // Send confirmation email for customers
      await this.mailService.sendUserConfirmation(userData, token);
    }

    const access_token = await this.signIn(userData.email, createUserInput.password);

    // Fetch permissions based on user type
    let result = [];
    if (userData.type !== UserType.Customer) {
      result = await this.permissionRepository
        .createQueryBuilder('permission')
        .leftJoinAndSelect('permission.permissions', 'permissions')
        .where(`permission.type_name = :typeName`, { typeName: userData.type })
        .select([
          'permission.id',
          'permission.type_name',
          'permissions.id',
          'permissions.type',
          'permissions.read',
          'permissions.write',
        ])
        .getMany();
    }

    if (result.length === 0) {
      return {
        message: 'Permissions not found for the specified user type.',
      };
    }

    const formattedResult = result.map((permission) => ({
      id: permission.id,
      type_name: permission.type_name,
      permission: permission.permissions.map((p) => ({
        id: p.id,
        type: p.type,
        read: p.read,
        write: p.write,
      })),
    }));

    return {
      token: access_token.access_token,
      type_name: [`${formattedResult[0].type_name}`],
      permissions: formattedResult[0].permission,
    };
  }

  async login(loginInput: LoginDto): Promise<{ message: string; } | AuthResponse> {
    const user = await this.userRepository.findOne({ where: { email: loginInput.email } });

    if (!user || !user.isVerified) {
      return {
        message: 'User Is Not Registered!',
      };
    }

    const permission = await this.permissionRepository.findOne({ where: { permission_name: user.type } });

    let access_token: { access_token: string }; // Move the declaration here

    if (!permission || permission.id === null) {
      access_token = await this.signIn(loginInput.email, loginInput.password);

      return {
        token: access_token.access_token,
        permissions: ['customer', 'admin'],
      };
    }

    access_token = await this.signIn(loginInput.email, loginInput.password);

    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.permissions', 'permissions')
      .where(`permission.id = ${permission.id}`)
      .select([
        'permission.id',
        'permission.type_name',
        'permissions.id',
        'permissions.type',
        'permissions.read',
        'permissions.write',
      ])
      .getMany();

    const formattedResult = result.map((permission) => ({
      id: permission.id,
      type_name: permission.type_name,
      permission: permission.permissions.map((p) => ({
        id: p.id,
        type: p.type,
        read: p.read,
        write: p.write,
      })),
    }));

    return {
      token: access_token.access_token,
      type_name: [`${formattedResult[0].type_name}`],
      permissions: formattedResult[0].permission,
    };
  }

  async changePassword(
    changePasswordInput: ChangePasswordDto,
  ): Promise<{ message: string } | CoreResponse> {
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
      user.created_at = new Date();
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

    const existEmail = await this.userRepository.findOne({ where: { email: verifyForgetPasswordTokenInput.email } });

    if (!existEmail) {
      return {
        success: false,
        message: 'Email does not exist',
      };
    }

    const otpVerificationResult = await this.verifyOtp(verifyForgetPasswordTokenInput.token);

    if (typeof otpVerificationResult === 'boolean' && otpVerificationResult) {
      return {
        success: true,
        message: 'Password change successful',
      };
    } else {
      return {
        success: false,
        message: 'OTP verification failed',
      };
    }
  }

  async resetPassword(
    resetPasswordInput: ResetPasswordDto,
  ): Promise<CoreResponse> {

    // Find the user with the specified email
    const user = await this.userRepository.findOne({ where: { email: resetPasswordInput.email } });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Verify the OTP
    const otpVerificationResult = await this.verifyOtp(resetPasswordInput.token);

    if (typeof otpVerificationResult === 'boolean' && otpVerificationResult) {
      // Update the user's password
      user.password = resetPasswordInput.password;
      await this.userRepository.save(user);

      return {
        success: true,
        message: 'Password change successful',
      };
    } else {
      return {
        success: false,
        message: 'OTP verification failed',
      };
    }
  }

  async socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponse> {

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

    return {
      // token: access_token.access_token,
      token: "jwt token",
      type_name: [`${formattedResult[0].type_name}`],
      permissions: formattedResult[0].permission
    };

  }

  async otpLogin(otpLoginDto: OtpLoginDto): Promise<AuthResponse> {
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

    return {
      // token: access_token.access_token,
      token: "jwt token",
      type_name: [`${formattedResult[0].type_name}`],
      permissions: formattedResult[0].permission
    };
  }

  async verifyOtpCode(verifyOtpInput: VerifyOtpDto): Promise<CoreResponse> {
    const result = await this.verifyOtp(verifyOtpInput.code);

    if (typeof result === 'boolean') {
      return {
        message: result ? 'OTP verification successful' : 'OTP verification failed',
        success: result,
      };
    } else if ('status' in result) {
      return {
        message: result.status ? 'OTP verification successful' : 'OTP verification failed',
        success: result.status,
      };
    } else {
      return {
        message: result.message,
        success: false,
      };
    }
  }

  async sendOtpCode(otpInput: OtpDto): Promise<OtpResponse> {

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

  async me(email: string, id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: email ? { email: email } : { id: id },
      relations: ["profile", "address", "shops", "orders", "profile.socials", "address.address", "dealer"]
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} and id ${id} not found`);
    }
    return user;
  }

  // updateUser(id: number, updateUserInput: UpdateUserInput) {
  //   return `This action updates a #${id} user`;
  // }
}
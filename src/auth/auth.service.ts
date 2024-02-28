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
import { error } from 'console';

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
    console.log("otpppppppppppp________",otp);
    return otp;
  }

  async destroyOtp(user: User): Promise<void> {
    console.log("user-destroy*************", user)
    user.otp = null;
    // user.created_at = null;
    await this.userRepository.save(user);
  }

  async verifyOtp(otp: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { otp }, relations: ['type'] });

    if (!user) {
      return false;
    }

    const otpCreatedAt = new Date(user.created_at);

    // If created_at is a string, parse it to Date
    if (!(otpCreatedAt instanceof Date && !isNaN(otpCreatedAt.getTime()))) {
      user.created_at = new Date(user.created_at);
    }

    const now = new Date();
    const elapsedTime = now.getTime() - user.created_at.getTime();
    const oneMinuteInMilliseconds = 60 * 1000;

    if (elapsedTime > oneMinuteInMilliseconds) {
      await this.destroyOtp(user);
      return false;
    }

    if (user.otp !== Number(otp)) {
      console.log("return false", false)
      return false;
    }

    user.isVerified = true;
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
    console.log("createUserInput###*******", createUserInput);

    const existingUser = await this.userRepository.findOne({
      where: { email: createUserInput.email },
      relations: ['type'],
    });

    console.log('first***112', existingUser);

    if (existingUser) {
      const usr_type = existingUser.type;

      console.log('usr_type***116', usr_type);

      const otp = await this.generateOtp();
      console.log("firstOTP++++++++++",otp)
      const token = Math.floor(100 + Math.random() * 900).toString();

      existingUser.otp = otp;
      existingUser.created_at = new Date();

      await this.userRepository.save(existingUser);

      console.log('127*****', usr_type.type_name);

      if (usr_type.type_name === UserType.Customer) {
        // Send confirmation email for customers
        await this.mailService.sendUserConfirmation(existingUser, token);
      }

      return {
        message: 'OTP sent to your email.',
      };
    }

    console.log('createUserInput.type*****138', createUserInput.type);

    const permission = await this.permissionRepository.findOne({
      where: { permission_name: createUserInput.type } as unknown as { permission_name: string }, // Directly type 'where'
    });

    console.log("permission *******####", permission);

    const hashPass = await bcrypt.hash(createUserInput.password, 12);
    const userData = new User();
    userData.name = createUserInput.name;
    userData.email = createUserInput.email;
    userData.contact = createUserInput.contact;
    userData.password = hashPass;
    userData.created_at = new Date();
    userData.UsrBy = createUserInput.UsrBy;
    userData.type = permission; // Assign permission directly

    console.log('149*****usr_type.type_name');

    if (permission.type_name !== UserType.Customer) {
      userData.isVerified = true;
    }

    console.log("userData*******####", userData);
    await this.userRepository.save(userData);

    console.log('149*****usr_type.type_name');

    if (permission.type_name === UserType.Customer) {
      const token = Math.floor(100 + Math.random() * 900).toString();
      // Send confirmation email for customers
      await this.mailService.sendUserConfirmation(userData, token);
    }

    const access_token = await this.signIn(userData.email, createUserInput.password);

    // Fetch permissions based on user type
    let result = [];
    if (permission.type_name !== UserType.Customer) {
      console.log("permission.type_name****169", permission.type_name);
      result = await this.permissionRepository
        .createQueryBuilder('permission')
        .leftJoinAndSelect('permission.permissions', 'permissions')
        .where(`permission.type_name = :typeName`, { typeName: userData.type.type_name })
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

    console.log("result******", result);

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
    console.log(formattedResult[0])

    await this.mailService.successfullyRegister(userData);

    return {
      token: access_token.access_token,
      type_name: [`${formattedResult[0].type_name}`],
      permissions: formattedResult[0].permission,
    };
  }


  async login(loginInput: LoginDto): Promise<{ message: string; } | AuthResponse> {
    const user = await this.userRepository.findOne({ where: { email: loginInput.email }, relations: ['type'] });

    console.log("user#######*********202", user)

    if (!user || !user.isVerified) {
      return {
        message: 'User Is Not Registered!',
      };
    }

    console.log("user.type*********208", user.type)
    const permission = await this.permissionRepository.findOneBy(user.type);

    let access_token: { access_token: string };

    if (!permission || permission.id === null) {
      access_token = await this.signIn(loginInput.email, loginInput.password);
      console.log("first**********213")
      return {
        token: access_token.access_token,
        permissions: ['customer', 'admin'],
      };
    }

    console.log("permission*******221", permission)
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

    console.log("result---236**************", result)

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

    console.log("formattedResult---249**************", formattedResult)

    return {
      token: access_token.access_token,
      type_name: [`${formattedResult[0].type_name}`],
      permissions: formattedResult[0].permission,
    };
  }

  async changePassword(
    changePasswordInput: ChangePasswordDto,
  ): Promise<{ message: string } | CoreResponse> {
    const user = await this.userRepository.findOne({ where: { email: changePasswordInput.email }, relations: ['type'] })

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

  async forgetPassword(forgetPasswordInput: ForgetPasswordDto): Promise<CoreResponse> {
    const user = await this.userRepository.findOne({ where: { email: forgetPasswordInput.email }, relations: ['type'] });

    if (!user) {
      return {
        success: false,
        message: "User Email is Invalid",
      };
    }

    const otp = await this.generateOtp();
    const token = Math.floor(100 + Math.random() * 900).toString();

    user.otp = otp;
    user.created_at = new Date();

    await this.userRepository.save(user);

    try {
      await this.mailService.forgetPasswordUserConfirmation(user, token);
      return {
        success: true,
        message: 'OTP sent to your email.',
      };
    } catch (error) {
      // Handle mail sending error
      return {
        success: false,
        message: 'Error sending OTP email',
      };
    }
  }

  async verifyForgetPasswordToken(verifyForgetPasswordTokenInput: VerifyForgetPasswordDto): Promise<CoreResponse> {

    console.log("verifyForgetPasswordTokenInput***", verifyForgetPasswordTokenInput)
    const existEmail = await this.userRepository.findOne({ where: { email: verifyForgetPasswordTokenInput.email }, relations: ['type'] });

    if (!existEmail) {
      return {
        success: false,
        message: 'Email does not exist',
      };
    }

    const otpVerificationResult = await this.verifyOtp(verifyForgetPasswordTokenInput.token);

    if (otpVerificationResult) {
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


  async resetPassword(resetPasswordInput: ResetPasswordDto): Promise<CoreResponse> {
    console.log("resetPasswordInput****", resetPasswordInput)

    const user = await this.userRepository.findOne({ where: { email: resetPasswordInput.email }, relations: ['type'] });

    console.log("user****reset", user)
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const otpVerificationResult = await this.verifyOtp(Number(resetPasswordInput.token));

    if (otpVerificationResult) {
      const hashPass = await bcrypt.hash(resetPasswordInput.password, 12);
      user.password = hashPass;
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
    try {
      const result = await this.verifyOtp(verifyOtpInput.code);

      console.log("result***************", result);

      return {
        success: result,
        message: result ? 'OTP verification successful' : 'OTP verification failed',
      };
    } catch (error) {
      // Handle verification error
      return {
        success: false,
        message: 'Error verifying OTP',
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
      relations: ["profile", "address", "shops", "orders", "profile.socials", "address.address", "dealer", "type"]
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
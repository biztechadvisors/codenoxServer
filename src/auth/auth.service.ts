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
  ResendOtpDto,
} from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { User, UserType } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import Twilio from 'twilio';
import * as AWS from 'aws-sdk';
import { Response } from 'express';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  save(user: User) {
    throw new Error('Method not implemented.');
  }
  private sns: AWS.SNS;

  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    @InjectRepository(Permission) private permissionRepository: Repository<Permission>,
    private jwtService: JwtService,
    private mailService: MailService
  ) {
    this.sns = new AWS.SNS({
      region: 'ap-south-1', // e.g., 'us-east-1'
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async generateOtp(): Promise<number> {
    const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    return otp;
  }

  async destroyOtp(user: User): Promise<void> {
    user.otp = null;
    // user.created_at = null;
    await this.userRepository.save(user);
  }

  async resendOtp(resendOtpDto: ResendOtpDto): Promise<{ message: string } | AuthResponse> {
    const user = await this.userRepository.findOne({ where: { email: resendOtpDto.email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const otp = await this.generateOtp();
    user.otp = otp;
    user.created_at = new Date();
    const repo = await this.userRepository.save(user);
    await this.mailService.sendUserConfirmation(user, otp.toString()); // Assuming you have a method to send OTP
    return { message: 'OTP resent successfully.' };
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
      return false;
    }

    user.isVerified = true;
    // const access_token = await this.signIn(userData.email, createUserInput.password);

    await this.userRepository.save(user);
    // const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    //   try {
    //     await twilioClient.messages.create({
    //       body: 'You have successfully registered!',
    //       from: process.env.TWILIO_PHONE_NUMBER,
    //       to: user.contact
    //     });
    //   } catch (error) {
    //     console.error("Failed to send SMS:", error.message);
    //   }
    // Send SMS using AWS SNS
    const params = {
      Message: 'You have successfully registered!',
      PhoneNumber: user.contact, // Ensure the phone number is in E.164 format
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          'DataType': 'String',
          'StringValue': 'Codenox' // This is optional and used for Sender ID capabilities in supported countries
        }
      }
    };

    try {
      const sms = await this.sns.publish(params).promise();
      console.log("Message sent successfully 📩.");
    } catch (error) {
      console.error("Failed to send SMS:", error.message);
    }


    await this.mailService.successfullyRegister(user);
    return true;
  }

  async signIn(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email: email, isVerified: true } });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const payload = { sub: user.id, username: user.email };

      const access_token = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.access_secret,
        expiresIn: '1m',
      });

      const refresh_token = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.refresh_secret,
        expiresIn: '5m',
      });

      if (user?.refresh_token) {
        user.refresh_token = refresh_token;
        await this.userRepository.save(user);
      }

      return { access_token, refresh_token };
    } catch (error) {
      throw new UnauthorizedException(`signIn error ${error}`);
    }
  }

  async register(createUserInput: RegisterDto): Promise<{ message: string; } | AuthResponse> {

    const existingUser = await this.userRepository.findOne({
      where: { email: createUserInput.email },
      relations: ['type'],
    });

    if (existingUser) {
      const usr_type = existingUser.type;

      const otp = await this.generateOtp();
      const token = Math.floor(100 + Math.random() * 9999).toString();

      existingUser.otp = otp;
      existingUser.created_at = new Date();

      await this.userRepository.save(existingUser);

      if (usr_type?.type_name === UserType.Customer) {
        // Send confirmation email for customers
        await this.mailService.sendUserConfirmation(existingUser, token);
      }

      return {
        message: 'OTP sent to your email.',
      };
    }

    let permission;

    if (createUserInput.type?.permission_name) {
      permission = await this.permissionRepository.findOne({
        where: { permission_name: createUserInput.type.permission_name }
      });
    }

    if (permission) {
      // User with permission
      const hashPass = await bcrypt.hash(createUserInput.password, 12);
      const userData = new User();
      userData.name = createUserInput.name;
      userData.email = createUserInput.email;
      userData.contact = createUserInput.contact;
      userData.password = hashPass;
      userData.created_at = new Date();
      userData.UsrBy = createUserInput.UsrBy;
      userData.type = permission;

      if (createUserInput.UsrBy) {
        userData.isVerified = true;
      }

      await this.userRepository.save(userData);

      const token = Math.floor(100 + Math.random() * 900).toString();
      // Send confirmation email for users with permission

      await this.mailService.sendUserConfirmation(userData, token);

      // const access_token = await this.signIn(userData.email, createUserInput.password);

      // Fetch permissions based on user type
      // const result = await this.getPermissions(userData.type.type_name);

      // return {
      //   token: access_token.access_token,
      //   type_name: [`${userData.type.type_name}`],
      //   permissions: result,
      // };
      return { message: `Registerd Successfull OTP send in your Email` }
    } else {
      // Customer registration
      const hashPass = await bcrypt.hash(createUserInput.password, 12);
      const userData = new User();
      userData.name = createUserInput.name;
      userData.email = createUserInput.email;
      userData.contact = createUserInput.contact;
      userData.password = hashPass;
      userData.created_at = new Date();
      userData.UsrBy = createUserInput.UsrBy ? createUserInput.UsrBy : null;
      userData.isVerified = createUserInput.UsrBy ? true : false; // Assuming isVerified depends on UsrBy
      const token = Math.floor(100 + Math.random() * 9999).toString();

      if (!createUserInput.UsrBy) {
        userData.otp = Number(token)
        // Send confirmation email for customers
        await this.mailService.sendUserConfirmation(userData, token);
      }

      await this.userRepository.save(userData);

      return { message: `Registerd Successfull OTP send in your Email` }

      // const access_token = await this.signIn(userData.email, createUserInput.password);

      // return {
      //   token: access_token.access_token,
      //   type_name: [UserType.Customer],
      //   permissions: [],
      // };
    }
  }

  async getPermissions(typeName: string): Promise<any[]> {

    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.permissions', 'permissions')
      .where(`permission.type_name = :typeName`, { typeName })
      .select([
        'permission.id',
        'permission.type_name',
        'permissions.id',
        'permissions.type',
        'permissions.read',
        'permissions.write',
      ])
      .getMany();

    return result.map((permission) => ({
      id: permission.id,
      type_name: permission.type_name,
      permission: permission.permissions.map((p) => ({
        id: p.id,
        type: p.type,
        read: p.read,
        write: p.write,
      })),
    }));
  }

  async login(loginInput: LoginDto) {
    try {
      const user = await this.userRepository.findOne({ where: { email: loginInput.email }, relations: ['type'] });

      if (!user || !user.isVerified) {
        throw new UnauthorizedException('User Is Not Registered!');
      }

      const isMatch = await bcrypt.compare(loginInput.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid password');
      }

      const { access_token } = await this.signIn(loginInput.email);

      const permission = user.type ? await this.permissionRepository.findOneBy(user.type) : null;

      if (!permission || permission.id === null) {
        return {
          token: access_token,
          permissions: ['customer', 'admin', 'super_admin'],
        };
      }

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
        token: access_token,
        type_name: [`${formattedResult[0].type_name}`],
        permissions: formattedResult[0].permission,
      };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('An error occurred during login');
    }
  }

  async logout(logoutDto: LoginDto): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email: logoutDto.email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Invalidate the user's refresh token
    user.refresh_token = null;
    await this.userRepository.save(user);

    return 'User logged out successfully';
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
    const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    try {
      await twilioClient.messages.create({
        body: `You Change password using this code:${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.contact
      });
    } catch (error) {
      console.error("Failed to send SMS:", error.message);
    }

    try {
      await this.mailService.sendUserConfirmation(user, token);
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

    const user = await this.userRepository.findOne({ where: { email: resetPasswordInput.email }, relations: ['type'] });

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

  async getRelations(email) {
    const userWithDealer = await this.userRepository.findOne({
      where: { email: email, dealer: Not(IsNull()) }
    });

    if (userWithDealer) {
      return ["profile", "address", "shops", "orders", "profile.socials", "address.address", "type", "dealer"];
    } else {
      return ["profile", "address", "shops", "orders", "profile.socials", "address.address", "type"];
    }
  }

  async me(email: string, id: number): Promise<User> {

    const user = await this.userRepository.findOne({
      where: email ? { email: email } : { id: id },
      relations: await this.getRelations(email)
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
/* eslint-disable prettier/prettier */
import { BadRequestException, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { FindOperator, FindOptionsWhere, ILike, IsNull, Not, Repository } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import Twilio from 'twilio';
import * as AWS from 'aws-sdk';
import { jwtConstants } from './constants';
import { NotificationService } from 'src/notifications/services/notifications.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  relationsCache: any;
  save(user: User) {
    throw new Error('Method not implemented.');
  }
  private sns: AWS.SNS;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    @InjectRepository(Permission) private permissionRepository: Repository<Permission>,
    private jwtService: JwtService,
    private mailService: MailService,
    private notificationService: NotificationService, // Ensure this is correctly injected
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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

  async resendOtp(resendOtpDto: ResendOtpDto): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { email: resendOtpDto.email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const otp = await this.generateOtp();
      user.otp = otp;
      user.created_at = new Date();
      await this.userRepository.save(user);
      await this.mailService.sendUserConfirmation(user, otp.toString());

      return { message: 'OTP resent successfully.' };
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw new Error('Failed to resend OTP. Please try again.');
    }
  }

  async verifyOtp(otp: number): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ where: { otp }, relations: ['permission'] });

      if (!user) {
        return false;
      }

      const otpCreatedAt = new Date(user.created_at);
      const now = new Date();
      const elapsedTime = now.getTime() - otpCreatedAt.getTime();
      const oneMinuteInMilliseconds = 60 * 1000;

      if (elapsedTime > oneMinuteInMilliseconds) {
        await this.destroyOtp(user);
        return false;
      }

      if (user.otp !== otp) {
        return false;
      }

      user.isVerified = true;
      await this.userRepository.save(user);

      // Send SMS
      const smsParams = {
        Message: 'You have successfully registered!',
        PhoneNumber: user.contact, // Ensure the phone number is in E.164 format
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            'DataType': 'String',
            'StringValue': 'Codenox' // Optional: Sender ID for supported countries
          }
        }
      };

      await this.sns.publish(smsParams).promise();
      console.log("Message sent successfully.");

      await this.mailService.successfullyRegister(user);

      return true;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw new Error('Failed to verify OTP. Please try again.');
    }
  }

  async signIn(email: string): Promise<{ access_token: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email, isVerified: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const payload = { sub: user.id, username: user.email };
      const access_token = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.access_secret,
      });

      return { access_token };
    } catch (error) {
      console.error('signIn error:', error);
      throw new UnauthorizedException('An error occurred during sign-in');
    }
  }

  async register(createUserInput: RegisterDto): Promise<{ message: string }> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserInput.email },
        relations: ['permission'],
      });

      if (existingUser) {
        // If user already exists, generate OTP and send confirmation email
        const otp = await this.generateOtp();
        const token = Math.floor(100 + Math.random() * 9999).toString();

        existingUser.otp = otp;
        existingUser.created_at = new Date();
        await this.userRepository.save(existingUser);
        if (existingUser.permission?.type_name === UserType.Customer) {
          // Send confirmation email for customers
          await this.mailService.sendUserConfirmation(existingUser, token);
        }
        return { message: 'OTP sent to your email.' };
      }

      let permission: Permission | null = null;

      if (createUserInput.permission) {
        // Check if user type has a permission name
        permission = await this.permissionRepository.findOne({
          where: { permission_name: ILike(createUserInput.permission) as unknown as FindOperator<string> },
        });
      }

      const hashPass = await bcrypt.hash(createUserInput.password, 12);

      const userData = new User();
      userData.name = createUserInput.name;
      userData.email = createUserInput.email;
      userData.contact = createUserInput.contact;
      userData.password = hashPass;
      userData.created_at = new Date();
      userData.createdBy = createUserInput.createdBy ? createUserInput.createdBy : null;
      userData.isVerified = createUserInput.createdBy ? true : false; // Assuming isVerified depends on createdBy

      if (createUserInput.createdBy) {
        const parentUsr = await this.userRepository.findOne({
          where: { id: createUserInput.createdBy.id },
          relations: ['permission'],
        });
        if (parentUsr?.permission.type_name === UserType.Company) {
          const existingDealerCount = await this.userRepository.createQueryBuilder('user')
            .innerJoin('user.permission', 'permission')
            .where('user.createdBy = :createdBy', { createdBy: parentUsr.id })
            .andWhere('permission.type_name = :type_name', { type_name: UserType.Dealer })
            .getCount();

          if (existingDealerCount >= (parentUsr.managed_shop.dealerCount)) {
            throw new BadRequestException('Cannot add more users, dealerCount limit reached.');
          }
        }
      }

      if (permission) {
        userData.permission = permission;
        const token = Math.floor(100 + Math.random() * 900).toString();
        // Send confirmation email for users with permission
        await this.mailService.sendPermissionUserConfirmation(createUserInput.password, userData, token);
      } else {
        // Customer registration
        const token = Math.floor(100 + Math.random() * 9999).toString();
        if (!createUserInput.createdBy) {
          userData.otp = Number(token);
          // Send confirmation email for customers
          await this.mailService.sendUserConfirmation(userData, token);
        }
      }

      await this.userRepository.save(userData);

      // Dynamically create notification
      let notificationTitle: string;
      let notificationMessage: string;

      if (userData.permission && userData.permission.type_name === UserType.Dealer) {
        notificationTitle = 'Welcome Dealer!';
        notificationMessage = 'You have been successfully registered as a dealer.';
      } else if (userData.permission && userData.permission.type_name === UserType.Staff) {
        notificationTitle = 'Welcome Staff!';
        notificationMessage = 'You have been successfully registered as a staff member.';
      } else {
        notificationTitle = 'Welcome!';
        notificationMessage = 'Your account has been successfully created.';
      }

      await this.notificationService.createNotification(
        userData.id,
        notificationTitle,
        notificationMessage,
      );

      return { message: 'Registered successfully. OTP sent to your email.' };
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Throw the original error
    }
  }

  async getPermissions(typeName: string): Promise<any[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.permissions', 'permissions')
      .where('permission.type_name = :typeName', { typeName })
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
      const user = await this.userRepository.findOne({
        where: { email: loginInput.email },
        relations: ['permission', 'dealer'],
      });

      if (!user || !user.isVerified) {
        throw new UnauthorizedException('User is not registered or not verified');
      }

      const isMatch = await bcrypt.compare(loginInput.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid password');
      }

      const { access_token } = await this.signIn(loginInput.email);

      let formattedPermissions: any[] = [];
      if (user.permission && user.permission.type_name) {
        const permissions = await this.getPermissions(user.permission.type_name);
        formattedPermissions = permissions.map((permission) => ({
          id: permission.id,
          type_name: permission.type_name,
          permission: permission.permission,
        }));
      } else {
        formattedPermissions = [{
          id: null,
          type_name: 'default',
          permission: [
            { id: 'Customer', type: 'default', read: true, write: true },
            { id: 'Admin', type: 'default', read: true, write: true },
            { id: 'Super_Admin', type: 'default', read: true, write: true }
          ]
        }];
      }

      return {
        token: access_token,
        type_name: formattedPermissions[0]?.type_name ? [formattedPermissions[0].type_name] : [],
        permissions: formattedPermissions[0]?.permission || [],
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('An error occurred during login');
    }
  }

  // async getPermissions(typeName: string): Promise<any[]> {
  //   const result = await this.permissionRepository
  //     .createQueryBuilder('permission')
  //     .leftJoinAndSelect('permission.permissions', 'permissions')
  //     .where(`permission.type_name = :typeName`, { typeName })
  //     .select([
  //       'permission.id',
  //       'permission.type_name',
  //       'permissions.id',
  //       'permissions.type',
  //       'permissions.read',
  //       'permissions.write',
  //     ])
  //     .getMany();

  //   return result.map((permission) => ({
  //     id: permission.id,
  //     type_name: permission.type_name,
  //     permission: permission.permissions.map((p) => ({
  //       id: p.id,
  //       type: p.type,
  //       read: p.read,
  //       write: p.write,
  //     })),
  //   }));
  // }

  // async login(loginInput: LoginDto) {
  //   try {

  //     const user = await this.userRepository.findOne({ where: { email: loginInput.email }, relations: ['permission', 'dealer'] });

  //     if (!user || !user.isVerified) {
  //       throw new UnauthorizedException('User Is Not Registered!');
  //     }

  //     const isMatch = await bcrypt.compare(loginInput.password, user.password);
  //     if (!isMatch) {
  //       throw new UnauthorizedException('Invalid password');
  //     }

  //     const { access_token } = await this.signIn(loginInput.email);

  //     const permission = user.permission ? await this.permissionRepository.findOne({ where: { id: user.permission.id } }) : null;

  //     if (!permission || permission.id === null) {
  //       return {
  //         token: access_token,
  //         permissions: ['customer', 'admin', 'super_admin'],
  //       };
  //     }

  //     const result = await this.permissionRepository
  //       .createQueryBuilder('permission')
  //       .leftJoinAndSelect('permission.permissions', 'permissions')
  //       .where(`permission.id = ${permission.id}`)
  //       .select([
  //         'permission.id',
  //         'permission.type_name',
  //         'permissions.id',
  //         'permissions.type',
  //         'permissions.read',
  //         'permissions.write',
  //       ])
  //       .getMany();

  //     const formattedResult = result.map((permission) => ({
  //       id: permission.id,
  //       type_name: permission.type_name,
  //       permission: permission.permissions.map((p) => ({
  //         id: p.id,
  //         type: p.type,
  //         read: p.read,
  //         write: p.write,
  //       })),
  //     }));

  //     return {
  //       token: access_token,
  //       type_name: [`${formattedResult[0].type_name}`],
  //       permissions: formattedResult[0].permission,
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     throw new UnauthorizedException('An error occurred during login');
  //   }
  // }


  async logout(logoutDto: LoginDto): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email: logoutDto.email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    user.is_active = false
    await this.userRepository.save(user);

    return 'User logged out successfully';
  }

  async changePassword(
    changePasswordInput: ChangePasswordDto,
  ): Promise<{ message: string } | CoreResponse> {
    const user = await this.userRepository.findOne({ where: { email: changePasswordInput.email }, relations: ['permission'] })

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
    const user = await this.userRepository.findOne({ where: { email: forgetPasswordInput.email }, relations: ['permission'] });

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

    const existEmail = await this.userRepository.findOne({ where: { email: verifyForgetPasswordTokenInput.email }, relations: ['permission'] });

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

    const user = await this.userRepository.findOne({ where: { email: resetPasswordInput.email }, relations: ['permission'] });

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
    try {
      const result = await this.getPermissionsByPermissionId(6);
      return {
        token: "jwt token",
        type_name: [result.type_name],
        permissions: result.permission,
      };
    } catch (error) {
      console.error('Social login error:', error);
      throw new Error('Failed to perform social login.');
    }
  }

  async otpLogin(otpLoginDto: OtpLoginDto): Promise<AuthResponse> {
    try {
      const result = await this.getPermissionsByPermissionId(6);
      return {
        token: "jwt token",
        type_name: [result.type_name],
        permissions: result.permission,
      };
    } catch (error) {
      console.error('OTP login error:', error);
      throw new Error('Failed to perform OTP login.');
    }
  }

  async verifyOtpCode(verifyOtpInput: VerifyOtpDto): Promise<CoreResponse> {
    try {
      const result = await this.verifyOtp(verifyOtpInput.code);
      return {
        success: result,
        message: result ? 'OTP verification successful' : 'OTP verification failed',
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Error verifying OTP',
      };
    }
  }

  async sendOtpToPhoneNumber(phoneNumber: string): Promise<Object> {
    try {
      // Generate OTP
      const otp = await this.generateOtp();

      // Prepare SMS message
      const params = {
        Message: `Your OTP is: ${otp}`, // Message body containing the OTP
        PhoneNumber: phoneNumber, // Phone number to which the OTP will be sent
      };

      // Send OTP using AWS SNS
      await this.sns.publish(params).promise();
      return params; // Return the generated OTP
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP.');
    }
  }

  async sendOtpCode(otpInput: OtpDto): Promise<OtpResponse> {
    try {
      const { phone_number } = otpInput;

      // Call the function to send OTP to the provided phone number
      const otp = await this.sendOtpToPhoneNumber(phone_number);

      // Return the response
      return {
        message: 'success',
        success: true,
        id: '1',
        provider: 'aws-sns', // Update with the correct provider name
        phone_number: phone_number,
        is_contact_exist: true, // Assuming the contact always exists when OTP is sent
      };
    } catch (error) {
      console.error('OTP sending error:', error);
      throw new Error('Failed to send OTP.');
    }
  }

  private async getPermissionsByPermissionId(permissionId: number): Promise<{ type_name: string; permission: any }> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.permissions', 'permissions')
      .where(`permission.id = ${permissionId}`)
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

    if (formattedResult.length === 0) {
      throw new NotFoundException(`Permission not found with ID: ${permissionId}`);
    }

    return {
      type_name: formattedResult[0].type_name,
      permission: formattedResult[0].permission,
    };
  }

  async getUser({ id }: any): Promise<User | undefined> {
    // Use the appropriate method to find a user by ID in your UserRepository
    return this.userRepository.findOne(id); // Assuming findOne is the method to find a user by ID
  }

  async getUsers({ text, first, page }: any) {
    const startIndex = (page - 1) * first;
    const endIndex = page * first;
    let data: User[];

    if (text) {
      // Use the appropriate method to find users by name or email
      data = await this.userRepository.find({ where: { name: text } }); // Adjust the condition according to your requirements
    } else {
      // Use the appropriate method to find all users
      data = await this.userRepository.find();
    }

    const results = data.slice(startIndex, endIndex);

    return {
      data: results,
      paginatorInfo: (data.length, page, first), // Assuming paginate is defined elsewhere
    };
  }

  async me(email: string, id: number): Promise<User> {
    // Generate a cache key based on the email or id
    const cacheKey = `user:${email || id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);

    if (cachedUser) {
      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return cachedUser;
    }

    const relations = await this.getRelations(email);

    const user = await this.userRepository.findOne({
      where: email ? { email } : { id },
      relations,
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} and id ${id} not found`);
    }

    // Cache the user data
    await this.cacheManager.set(cacheKey, user, 1800); // Cache for 30 minutes
    this.logger.log(`Data cached with key: ${cacheKey}`);

    return user;
  }


  private async getRelations(email: string): Promise<string[]> {

    const userWithDealer = await this.userRepository.findOne({
      where: { email, dealer: Not(IsNull()) },
    });

    let relations: string[];
    if (userWithDealer) {
      relations = ["profile", "address", "owned_shops", "orders", "profile.socials", "address.address", "permission", "dealer", "managed_shop", "createdBy", "createdBy.managed_shop"];
    } else {
      relations = ["profile", "address", "owned_shops", "orders", "profile.socials", "address.address", "permission", "managed_shop", "createdBy", "createdBy.managed_shop"];
    }

    return relations;
  }

  async updateUser(id: number, updateUserInput: any): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['permission', 'createdBy'] });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Handle password update
    if (updateUserInput.password) {
      updateUserInput.password = await bcrypt.hash(updateUserInput.password, 12);
    }

    // Handle createdBy validation if present
    if (updateUserInput.createdBy) {
      const parentUsr = await this.userRepository.findOne({
        where: { id: updateUserInput.createdBy },
        relations: ['permission'],
      });

      if (parentUsr?.permission?.type_name === UserType.Company) {
        const existingDealerCount = await this.userRepository.createQueryBuilder('user')
          .innerJoin('user.permission', 'permission')
          .where('user.createdBy = :createdBy', { createdBy: parentUsr.id })
          .andWhere('permission.type_name = :type_name', { type_name: UserType.Dealer })
          .getCount();

        console.log("first 752 ", parentUsr)
        if (existingDealerCount >= (parentUsr.managed_shop.dealerCount || 0)) {
          throw new BadRequestException('Cannot add more users, dealerCount limit reached.');
        }
      }

      user.createdBy = parentUsr;
    }

    // Handle type change if present
    if (updateUserInput.permission) {
      const permission = await this.permissionRepository.findOne({
        where: { permission_name: ILike(updateUserInput.permission) as unknown as FindOperator<string> },
      });

      if (permission) {
        user.permission = permission;

        // Set dealerCount only if the user is of type Company
        if (permission.type_name === UserType.Company) {
          user.managed_shop.dealerCount = updateUserInput.dealerCount || 0;
        } else {
          user.managed_shop.dealerCount = null; // Reset dealerCount if type changes to something else
        }
      }
    }

    // Update other user properties
    Object.assign(user, updateUserInput);

    // Save the updated user entity back to the database
    return this.userRepository.save(user);
  }

}
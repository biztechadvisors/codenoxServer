/* eslint-disable prettier/prettier */
import { BadRequestException, ConflictException, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { FindOperator, ILike, IsNull, Not } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import Twilio from 'twilio';
import { jwtConstants } from './auth-helper/constants';
import { NotificationService } from 'src/notifications/services/notifications.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { PermissionRepository } from '../permission/permission.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly twilioClient: Twilio.Twilio;
  private readonly twilioVerifyServiceSid: string;
  private readonly otpExpiryTime = 60 * 1000; // 1 minute

  private emailVerificationCodes: Map<string, { otp: string, createdAt: Date }> = new Map();

  constructor(
    @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
    @InjectRepository(PermissionRepository) private readonly permissionRepository: PermissionRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {
    this.twilioVerifyServiceSid = this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioClient = Twilio(this.configService.get<string>('TWILIO_ACCOUNT_SID'), authToken);
  }

  private async sendSms(phoneNumber: string, message: string): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        to: phoneNumber,
        from: '+19383560164',
        body: message,
      });
      this.logger.log(`SMS sent successfully to: ${phoneNumber}`);
    } catch (error) {
      this.logger.error('Failed to send SMS:', error.message);
      throw new HttpException('Failed to send SMS.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateOtp(length = 6): Promise<string> {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      otp += digits[randomIndex];

    }
    return otp.toString();
  }

  async destroyOtp(user: User): Promise<void> {
    try {
      user.otp = null;
      await this.userRepository.save(user);
    } catch (error) {
      this.logger.error('Error destroying OTP:', error);
      throw new HttpException('Failed to destroy OTP.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async resendOtp(resendOtpDto: ResendOtpDto): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { email: resendOtpDto.email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const otp = await this.generateOtp();
      user.otp = parseInt(otp);
      user.created_at = new Date();
      await this.userRepository.save(user);
      await this.mailService.sendUserConfirmation(user, otp.toString());

      return { message: 'OTP resent successfully.' };
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw new Error('Failed to resend OTP. Please try again.');
    }
  }

  async signIn(payload: any): Promise<{ access_token: string; refresh_token: string }> {
    const { email, phoneNumber, user } = payload;
    try {
      const tokenPayload = {
        sub: user?.id || new Date().getTime(), // Ensure unique user ID or timestamp
        username: user?.email || email || phoneNumber,
      };

      // Create a new access token
      const accessToken = await this.jwtService.signAsync(tokenPayload, {
        secret: jwtConstants.access_secret,
        expiresIn: '4m',
      });

      // Generate a refresh token only if necessary (e.g., upon first login)
      const refreshToken = await this.jwtService.signAsync(tokenPayload, {
        secret: jwtConstants.refresh_secret,
        expiresIn: '7d',
      });

      return { access_token: accessToken, refresh_token: refreshToken };
    } catch (error) {
      this.logger.error('SignIn error:', error);
      throw new UnauthorizedException('An error occurred during sign-in');
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

  async register(createUserInput: RegisterDto): Promise<{ message: string }> {
    try {
      if (!createUserInput.email && !createUserInput.contact) {
        throw new BadRequestException('Either email or phone number is required.');
      }

      const existingUser = await this.userRepository.findOne({
        where: createUserInput.email ? { email: createUserInput.email } : createUserInput.contact ? { contact: createUserInput.contact } : undefined,
      });

      if (existingUser) {
        if (!existingUser.isVerified) {
          const otp = await this.generateOtp();
          existingUser.otp = parseInt(otp);
          existingUser.created_at = new Date();
          await this.userRepository.save(existingUser);

          if (![UserType.Dealer, UserType.Company, UserType.Staff].includes(existingUser.permission?.type_name as UserType)) {
            await this.mailService.sendUserConfirmation(existingUser, otp.toString());
          }

          return { message: 'OTP sent to your email.' };
        } else {
          throw new ConflictException('User already registered and verified.');
        }
      }

      let permission: Permission | null = null;
      if (createUserInput.permission) {
        try {
          permission = await this.permissionRepository.findOne({
            where: { permission_name: ILike(createUserInput.permission) as unknown as FindOperator<string> },
          });

          if (!permission) {
            throw new BadRequestException('Invalid permission type.');
          }
        } catch (error) {
          this.logger.error('Error fetching permission:', error);
          throw new InternalServerErrorException('Error retrieving permission.');
        }
      }

      const hashPass = createUserInput.password ? await bcrypt.hash(createUserInput.password, 12) : null;

      const userData = new User();
      userData.name = createUserInput.name || null;
      userData.email = createUserInput.email || null;
      userData.contact = createUserInput.contact || null;
      userData.password = hashPass;
      userData.created_at = new Date();
      userData.createdBy = createUserInput.createdBy || null;
      userData.isVerified = !!createUserInput.createdBy;

      if (createUserInput.createdBy) {
        const parentUsr = await this.userRepository.findOne({
          where: { id: createUserInput.createdBy.id },
          relations: ['permission'],
        });

        if (!parentUsr) {
          throw new BadRequestException('Invalid creator user.');
        }

        if (parentUsr.permission.type_name === UserType.Company && permission?.type_name === UserType.Dealer) {
          const existingDealerCount = await this.userRepository.createQueryBuilder('user')
            .innerJoin('user.permission', 'permission')
            .where('user.createdBy = :createdBy', { createdBy: parentUsr.id })
            .andWhere('permission.type_name = :type_name', { type_name: UserType.Dealer })
            .getCount();

          if (existingDealerCount >= parentUsr.managed_shop.dealerCount) {
            throw new BadRequestException('Dealer count limit reached.');
          }
        }
      }

      userData.permission = permission || null;

      const otpToken = await this.generateOtp();

      if (createUserInput.email) {
        userData.otp = parseInt(otpToken);
        await this.mailService.sendUserConfirmation(userData, otpToken.toString());
      } else if (createUserInput.contact) {
        const otpDto: OtpDto = { phone_number: createUserInput.contact };
        try {
          const response = await this.sendOtpCode(otpDto);
          if (!response.success) {
            throw new InternalServerErrorException('Error sending OTP');
          }
        } catch (error) {
          this.logger.error('Error sending OTP:', error.message);
          throw new InternalServerErrorException('Error sending OTP');
        }
      }

      await this.userRepository.save(userData);

      // Send notifications (if applicable)
      const notificationTitle = userData.permission?.type_name === UserType.Dealer
        ? 'Welcome Dealer!'
        : userData.permission?.type_name === UserType.Staff
          ? 'Welcome Staff!'
          : 'Welcome!';

      const notificationMessage = userData.permission?.type_name === UserType.Dealer
        ? 'You have been successfully registered as a dealer.'
        : userData.permission?.type_name === UserType.Staff
          ? 'You have been successfully registered as a staff member.'
          : 'Your account has been successfully created.';

      await this.notificationService.createNotification(
        userData.id,
        notificationTitle,
        notificationMessage,
      );

      return { message: 'Registered successfully. OTP sent to your email.' };
    } catch (error) {
      this.logger.error('Registration error:', error);
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException('Registration failed. Please try again.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async verifyOtp(verifyOtpInput: VerifyOtpDto): Promise<{ access_token: string; success: boolean; message: string }> {
    const { phone_number, email, code } = verifyOtpInput;

    let user = null;

    if (phone_number) {
      const phoneOtpVerification = await this.verifyPhoneOtp(phone_number, code.toString());
      if (!phoneOtpVerification.success) {
        return { success: false, message: phoneOtpVerification.message, access_token: null };
      }
      user = await this.getUserByPhoneNumber(phone_number);
    } else if (email) {
      user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return { success: false, message: 'User not found.', access_token: null };
      }

      const isOtpValid = this.isOtpValid(user, code.toString());
      if (!isOtpValid.success) {
        return { success: false, message: isOtpValid.message, access_token: null };
      }

      user.isVerified = true;
      user.otp = null;
      await this.userRepository.save(user);
      await this.mailService.successfullyRegister(user);
    } else {
      return { success: false, message: 'Invalid input. Either phone number or email is required.', access_token: null };
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return { success: true, message: 'OTP verification successful!', access_token };
  }

  private async verifyPhoneOtp(phone_number: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const verificationCheck = await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
        .verificationChecks.create({ to: phone_number, code: code.toString() });

      if (verificationCheck.status === 'approved') {
        const user = await this.getUserByPhoneNumber(phone_number);
        if (user) {
          user.isVerified = true;
          await this.userRepository.save(user);
        } else {
          await this.createNewUser(phone_number);
        }

        await this.sendSms(phone_number, 'Welcome to our service! We are glad to have you with us.');
        return { success: true, message: 'OTP verification successful' };
      } else {
        return { success: false, message: 'OTP verification failed' };
      }
    } catch (error) {
      this.logger.error('Failed to verify phone OTP:', error.message);
      throw new HttpException('Failed to verify OTP.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private isOtpValid(user: User, code: string): { success: boolean; message: string } {
    const now = new Date();
    const hasOtpExpired = user.otp && user.created_at && now.getTime() - new Date(user.created_at).getTime() > this.otpExpiryTime;

    if (hasOtpExpired) {
      this.destroyOtp(user);
      this.logger.warn('OTP expired for user:', user.id);
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (user.otp !== parseInt(code)) {
      this.logger.warn('Invalid OTP for user:', user.id);
      return { success: false, message: 'Invalid OTP.' };
    }

    return { success: true, message: 'OTP is valid' };
  }


  private async getUserByPhoneNumber(phone_number: string) {
    return await this.userRepository.findOne({ where: { contact: phone_number } });
  }

  private async createNewUser(phone_number: string) {
    const user = this.userRepository.create({
      contact: phone_number,
      isVerified: true,
    });
    await this.userRepository.save(user);
    await this.sendSms(phone_number, 'Welcome to our service!');
  }

  async login(loginInput: LoginDto): Promise<AuthResponse> {
    try {
      // Ensure email or contact is provided
      if (!loginInput.email && !loginInput.contact) {
        throw new BadRequestException('Email or contact is required.');
      }

      // Fetch the user by email or contact
      const user = await this.userRepository.findOne({
        where: loginInput.email
          ? { email: loginInput.email }
          : { contact: loginInput.contact },
        relations: ['permission', 'dealer'],
      });

      // Handle non-existent user or unverified user
      if (!user || !user.isVerified) {
        throw new UnauthorizedException('User not registered or not verified.');
      }

      // Verify password if provided
      if (loginInput.password) {
        const isMatch = await bcrypt.compare(loginInput.password, user.password);
        if (!isMatch) {
          throw new UnauthorizedException('Invalid password.');
        }
      } else {
        throw new BadRequestException('Password is required.');
      }

      // Generate access token
      const { access_token, refresh_token } = await this.signIn(user);

      // Fetch and format permissions
      let formattedPermissions: any[] = [];
      if (user.permission?.type_name) {
        const permissions = await this.getPermissions(user.permission.type_name);
        formattedPermissions = permissions.map(permission => ({
          id: permission.id,
          type_name: permission.type_name,
          permission: permission.permission,
        }));
      }

      // Return access token and permissions
      return {
        token: access_token,
        refreshToken: refresh_token,
        type_name: formattedPermissions[0]?.type_name ? [formattedPermissions[0].type_name] : [],
        permissions: formattedPermissions[0]?.permission || [],
      };
    } catch (error) {
      this.logger.error('Login error:', error);
      // Return a generic error message for security purposes
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  async logout(logoutDto: LoginDto): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email: logoutDto.email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    user.is_active = false
    await this.userRepository.save(user);

    return 'User logged out successfully';
  }

  async verifyOtpCode(verifyOtpInput: any): Promise<{ success: boolean; message: string }> {
    const { phone_number, email, token } = verifyOtpInput;

    if (phone_number) {
      try {
        const verificationCheck = await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
          .verificationChecks.create({
            to: phone_number,
            code: token, // Ensure the code is passed as a string
          });

        if (verificationCheck.status === 'approved') {
          return {
            success: true,
            message: 'OTP verification successful',
          };
        } else {
          return {
            success: false,
            message: 'OTP verification failed',
          };
        }
      } catch (error) {
        this.logger.error('Failed to verify OTP:', error.message);
        throw new HttpException('Failed to verify OTP.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else if (email) {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return { success: false, message: 'User not found.' };
      }

      const now = new Date();
      const otpExpiryTime = 60 * 1000; // 1 minute
      const hasOtpExpired = user.otp && user.created_at && now.getTime() - new Date(user.created_at).getTime() > otpExpiryTime;

      if (hasOtpExpired) {
        await this.destroyOtp(user); // Clear OTP if it has expired
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }

      if (user.otp !== parseInt(token)) {
        return { success: false, message: 'Invalid OTP.' };
      }

      await this.destroyOtp(user);
      return { success: true, message: 'OTP verification successful!' };
    }

    return { success: false, message: 'Either email or phone number must be provided.' };
  }

  async changePassword(changePasswordInput: ChangePasswordDto): Promise<CoreResponse> {
    const user = await this.userRepository.findOne({
      where: { email: changePasswordInput.email, contact: changePasswordInput.phone_number },
      relations: ['permission'],
    });

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const isMatch = await bcrypt.compare(changePasswordInput.oldPassword, user.password);

    if (!isMatch) {
      return {
        success: false,
        message: 'Old password is incorrect.',
      };
    }

    const hashPass = await bcrypt.hash(changePasswordInput.newPassword, 12);
    user.password = hashPass;
    await this.userRepository.save(user);

    return { success: true, message: 'Password changed successfully.' };
  }

  async forgetPassword(forgetPasswordInput: ForgetPasswordDto): Promise<CoreResponse> {
    const user = await this.userRepository.findOne({
      where: { email: forgetPasswordInput.email, contact: forgetPasswordInput.phone_number },
      relations: ['permission'],
    });

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const otp = await this.generateOtp();
    user.otp = parseInt(otp);
    user.created_at = new Date();

    await this.userRepository.save(user);

    if (forgetPasswordInput.phone_number) {
      await this.sendSms(user.contact, `You can change your password using this code: ${otp}`);
    }

    if (forgetPasswordInput.email) {
      await this.mailService.sendUserConfirmation(user, otp.toString());
    }

    return { success: true, message: 'OTP sent to your registered contact.' };
  }

  async verifyForgetPasswordToken(verifyForgetPasswordTokenInput: VerifyForgetPasswordDto): Promise<CoreResponse> {
    const otpVerificationResult = await this.verifyOtpCode(verifyForgetPasswordTokenInput);

    if (otpVerificationResult.success) {
      return {
        success: true,
        message: 'OTP verification successful, you can proceed to change the password.',
      };
    } else {
      return {
        success: false,
        message: 'OTP verification failed.',
      };
    }
  }

  async resetPassword(resetPasswordInput: ResetPasswordDto): Promise<CoreResponse> {
    const otpVerificationResult = await this.verifyOtpCode({
      email: resetPasswordInput.email,
      phone_number: resetPasswordInput.phone_number,
      token: resetPasswordInput.token,
    });

    if (otpVerificationResult.success) {
      const user = await this.userRepository.findOne({
        where: { email: resetPasswordInput.email },
        relations: ['permission'],
      });

      if (!user) {
        return { success: false, message: 'User not found.' };
      }

      const hashPass = await bcrypt.hash(resetPasswordInput.password, 12);
      user.password = hashPass;
      await this.userRepository.save(user);

      return { success: true, message: 'Password changed successfully.' };
    } else {
      return {
        success: false,
        message: 'OTP verification failed. Cannot change the password.',
      };
    }
  }


  async socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponse> {
    try {
      const { provider, access_token } = socialLoginDto;

      // Fetch user profile from social login provider
      const profile = await this.getProfileFromProvider(provider, access_token);

      // Check if user already exists
      let user = await this.userRepository.findOne({ where: { email: profile.email } });

      if (!user) {
        // If user doesn't exist, create a new user
        user = new User();
        user.email = profile.email;
        user.name = profile.name || 'Unknown'; // Use profile name or default
        user.isVerified = true; // Assuming social login means the user is verified
        // Set other default properties if needed

        await this.userRepository.save(user);
      }

      // Generate JWT token
      const payload = { sub: user.id, email: user.email };
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.access_secret,
        expiresIn: '1h', // Adjust expiration time as needed
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: jwtConstants.refresh_secret,
        expiresIn: '7d', // Adjust expiration time as needed
      });

      // Get permissions if the user has any
      const permissions = user.permission ? await this.getPermissions(user.permission.type_name) : [];

      return {
        token: accessToken,
        refreshToken: refreshToken,
        type_name: user.permission?.type_name ? [user.permission.type_name] : [],
        permissions: permissions || [],
      };
    } catch (error) {
      this.logger.error('Social login error:', error.message);
      throw new HttpException('Failed to perform social login.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async getProfileFromProvider(provider: string, accessToken: string): Promise<any> {
    switch (provider) {
      case 'google':
        return this.getGoogleProfile(accessToken);
      case 'facebook':
        return this.getFacebookProfile(accessToken);
      // Add other providers as needed
      default:
        throw new HttpException('Unsupported social login provider', HttpStatus.BAD_REQUEST);
    }
  }

  private async getGoogleProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      return response.data;
    } catch (error) {
      this.logger.error('Google profile fetch error:', error.message);
      throw new HttpException('Failed to fetch Google profile.', HttpStatus.UNAUTHORIZED);
    }
  }

  private async getFacebookProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
      return response.data;
    } catch (error) {
      this.logger.error('Facebook profile fetch error:', error.message);
      throw new HttpException('Failed to fetch Facebook profile.', HttpStatus.UNAUTHORIZED);
    }
  }

  async sendOtpCode(otpInput: OtpDto): Promise<{ success: boolean; message: string }> {
    const { phone_number } = otpInput;

    // Ensure phone number is formatted correctly
    const formattedPhoneNumber = phone_number.startsWith('+') ? phone_number : `+${phone_number}`;

    try {
      console.log('Sending OTP to phone_number:', formattedPhoneNumber);

      // Create a verification request
      await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
        .verifications.create({
          to: formattedPhoneNumber, // Make sure this is a properly formatted phone number
          channel: 'sms', // Channel should be 'sms'
        });

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      this.logger.error('Failed to send OTP:', error.message);
      throw new HttpException('Failed to send OTP.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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

  async findUserByEmailOrId(email: string, id: string): Promise<User | undefined> {
    if (email) {
      return this.userRepository.findOne({ where: { email } });
    } else if (id) {
      return this.userRepository.findOne({ where: { id: parseInt(id) } });
    }
    throw new BadRequestException('Email or ID must be provided.');
  }

  async addWalletPoints(user: User, points: number): Promise<User> {
    user.walletPoints += points;

    try {
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      console.error('Failed to update user wallet points:', error);
      throw new Error('Could not update wallet points. Please try again.');
    }
  }


  // ------Guest Login-----------

  async requestSmsVerification(phoneNumber: string): Promise<void> {
    try {
      await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
        .verifications.create({
          to: phoneNumber,
          channel: 'sms',
        });
      this.logger.log(`SMS verification requested for: ${phoneNumber}`);
    } catch (error) {
      this.logger.error('Failed to request SMS verification:', error.message);
      throw new UnauthorizedException('Failed to request SMS verification.');
    }
  }

  async verifySmsCode(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const verificationCheck = await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
        .verificationChecks.create({
          to: phoneNumber,
          code: code,
        });
      return verificationCheck.status === 'approved';
    } catch (error) {
      this.logger.error('Failed to verify SMS code:', error.message);
      throw new UnauthorizedException('Failed to verify SMS code.');
    }
  }

  // Clean up OTP after use or expiration
  private destroyEmailOtp(email: string): void {
    this.emailVerificationCodes.delete(email);
    this.logger.log(`OTP for ${email} has been destroyed`);
  }

  // Send OTP via email
  async requestEmailVerification(email: string): Promise<void> {
    try {
      const otp = (await this.generateOtp()).toString();
      const createdAt = new Date();

      // Store OTP with timestamp
      this.emailVerificationCodes.set(email, { otp, createdAt });

      // Send OTP via email
      await this.mailService.sendUserConfirmation(email, otp);
      this.logger.log(`Email verification OTP sent to ${email}`);

    } catch (error) {
      this.logger.error('Failed to request email verification:', error.message);
      throw new UnauthorizedException('Failed to request email verification.');
    }
  }


  // Verify OTP
  async verifyEmailCode(email: string, code: string): Promise<{ success: boolean, message: string }> {
    try {
      const storedData = this.emailVerificationCodes.get(email);
      if (!storedData) {
        return { success: false, message: 'No OTP found. Please request a new one.' };
      }

      const { otp, createdAt } = storedData;
      const now = new Date();
      const otpExpiryTime = 60 * 1000; // 1 minute
      const hasOtpExpired = now.getTime() - createdAt.getTime() > otpExpiryTime;

      if (hasOtpExpired) {
        this.destroyEmailOtp(email);
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }

      if (otp !== code) {
        return { success: false, message: 'Invalid OTP.' };
      }

      // OTP is valid, clean up
      this.destroyEmailOtp(email);
      return { success: true, message: 'OTP verification successful!' };

    } catch (error) {
      this.logger.error('Failed to verify email code:', error.message);
      throw new UnauthorizedException('Failed to verify email code.');
    }
  }

}

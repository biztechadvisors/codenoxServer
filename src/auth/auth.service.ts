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
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class AuthService {
  save(user: User) {
    throw new Error('Method not implemented.');
  }

  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async generateOtp(): Promise<number> {
    const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
    return otp
  }

  async destroyOtp(otp: number, createdAt: Date): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { otp, createdAt },
    })
    if (!user) {
      return
    }
    // Destroy the OTP.
    user.otp = null
    user.createdAt = null
    await this.userRepository.save(user)
  }

  async verifyOtp(
    otp: number,
  ): Promise<{ status: boolean } | { message: string } | boolean> {
    // Check if the OTP exists.
    const user = await this.userRepository.findOne({ where: { otp } })
    if (!user) {
      return false
    }
    // Check if the OTP is older than 1 minute.
    const otpCreatedAt = new Date(user.createdAt)
    const now = new Date()
    const elapsedTime = now.getTime() - otpCreatedAt.getTime()
    const oneMinuteInMilliseconds = 60 * 1000
    if (elapsedTime > oneMinuteInMilliseconds) {
      // Destroy the OTP.
      await this.destroyOtp(otp, otpCreatedAt)
      // Prompt the user to request a new OTP.
      return {
        status: false,
        message: 'Please request a new OTP.',
      }
    }
    // Verify the OTP.
    if (user.otp !== otp) {
      return false
    }
    // Set the user's account as verified.
    user.isVerified = true
    user.otp = null
    await this.userRepository.save(user)
    return true
  }

  async signIn(email, pass) {
    const user = await this.userRepository.findOne({ where: { email: email, isVerified: true } });
    const isMatch = await bcrypt.compare(pass, user.password);

    if (isMatch) {
      // The password is correct.
      const payload = { sub: user.id, username: user.email };
      return {
        access_token: await this.jwtService.signAsync(payload),
      }
    } else {
      throw new UnauthorizedException()
    }
  }

  async register(
    createUserInput: RegisterDto,
  ): Promise<{ message: string } | AuthResponse> {
    
    const emailExist = await this.userRepository.findOne({
      where: { email: createUserInput.email },
    });

    if (emailExist) {
      const otp = await this.generateOtp()
      const token = Math.floor(100 + Math.random() * 900).toString()
      emailExist.otp = otp
      emailExist.createdAt = new Date()
      await this.userRepository.save(emailExist)

      if (emailExist.type === UserType.Customer) {
        await this.mailService.sendUserConfirmation(emailExist, token);
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
    userData.type = createUserInput.type; // Set the type
    userData.createdAt = new Date();

    if (createUserInput.type !== UserType.Customer) {
      userData.isVerified = true;
    }

    await this.userRepository.save(userData);

    if (userData.type === UserType.Customer) {
      const token = Math.floor(100 + Math.random() * 900).toString();
      await this.mailService.sendUserConfirmation(userData, token);
    }

    const access_token = await this.signIn(userData.email, userData.password);
    return {
      token: access_token.access_token,
      permissions: [createUserInput.permission as unknown as string],
    };

  }

  async login(loginInput: LoginDto): Promise<{ message: string; } | AuthResponse> {
    const user = await this.userRepository.findOne({ where: { email: loginInput.email } })
    if (!user || !user.isVerified) {
      return {
        message: 'User Is Not Regesired !'
      }
    }
    const access_token = await this.signIn(loginInput.email, loginInput.password)

    if (loginInput.type === UserType.Customer) {
      return {
        token: access_token.access_token,
        permissions: ['store_owner', 'customer'],
      }
    } else {
      return {
        token: access_token.access_token,
        permissions: ['super_admin', 'customer'],
      }
    }
  }

  async changePassword(
    changePasswordInput: ChangePasswordDto,
  ): Promise<{ message: string } | CoreResponse> {
    const user = await this.userRepository.findOne({ where: { email: changePasswordInput.email } })

    if (!user) {
      return {
        message: 'User Email is InValid',
      }
    }

    const isMatch = await bcrypt.compare(
      changePasswordInput.oldPassword,
      user.password,
    )

    if (!isMatch) {
      // The old password is incorrect.
      return {
        success: false,
        message: 'Old password is incorrect',
      }
    }

    const hashPass = await bcrypt.hash(changePasswordInput.newPassword, 12)
    user.password = hashPass
    await this.userRepository.save(user)

    return {
      success: true,
      message: 'Password change successful',
    }
  }

  async forgetPassword(
    forgetPasswordInput: ForgetPasswordDto,
  ): Promise<{ message: string } | CoreResponse> {
    console.log(forgetPasswordInput)

    const user = await this.userRepository.findOne({
      where: { email: forgetPasswordInput.email },
    })
    if (!user) {
      return {
        message: 'User Email is InValid',
      }
    }

    if (user) {
      const otp = await this.generateOtp()
      const token = Math.floor(100 + Math.random() * 900).toString()
      user.otp = otp
      user.createdAt = new Date()
      await this.userRepository.save(user)

      await this.mailService.sendUserConfirmation(user, token)
      return {
        success: true,
        message: 'OTP sent to your email.',
      }
    }
    // return {
    //   success: true,
    //   message: 'Password change successful',
    // };
  }

  async verifyForgetPasswordToken(
    verifyForgetPasswordTokenInput: VerifyForgetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(verifyForgetPasswordTokenInput)

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
    console.log(resetPasswordInput)

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
    console.log(socialLoginDto)
    return {
      token: 'jwt token',
      permissions: ['super_admin', 'customer'],
    }
  }

  async otpLogin(otpLoginDto: OtpLoginDto): Promise<AuthResponse> {
    console.log(otpLoginDto)
    return {
      token: 'jwt token',
      permissions: ['super_admin', 'customer'],
    }
  }

  async verifyOtpCode(verifyOtpInput: VerifyOtpDto): Promise<CoreResponse> {
    console.log(verifyOtpInput);
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
    console.log(otpInput);

    return {
      message: 'success',
      success: true,
      id: '1',
      provider: 'google',
      phone_number: '+919494949494',
      is_contact_exist: true,
    }
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
      relations: ["profile", "address", "shops", "orders", "profile.socials"]
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

/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  OtpDto,
  OtpLoginDto,
  RegisterDto,
  ResetPasswordDto,
  ResendOtpDto,
  SocialLoginDto,
  UpdateOtpDto,
  VerifyForgetPasswordDto,
  VerifyOtpDto,
} from './dto/create-auth.dto';
import { User } from 'aws-sdk/clients/budgets';
import { AddPointsDto } from './dto/addWalletPoints.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('register')
  createAccount(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verifyOtp')
  async verifyOtp(@Body() updateOtpDto: UpdateOtpDto) {
    return this.authService.verifyOtp(updateOtpDto.otp);
  }

  @HttpCode(HttpStatus.OK)
  @Post('token')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      console.error(error);
      throw error`Login Failed Error: ${error}`
    }
  }

  @Post('social-login-token')
  socialLogin(@Body() socialLoginDto: SocialLoginDto) {
    return this.authService.socialLogin(socialLoginDto);
  }
  @Post('otp-login')
  otpLogin(@Body() otpLoginDto: OtpLoginDto) {
    return this.authService.otpLogin(otpLoginDto);
  }
  @Post('send-otp-code')
  sendOtpCode(@Body() otpDto: OtpDto) {
    return this.authService.sendOtpCode(otpDto);
  }
  @Post('verify-otp-code')
  verifyOtpCode(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtpCode(verifyOtpDto);
  }
  @Post('forget-password')
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
  @Post('resend-otp')
  resendOtp(@Body() resendOtpDto: ResendOtpDto) {

    return this.authService.resendOtp(resendOtpDto);
  }
  @Post('change-password')
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() logoutDto: LoginDto): Promise<{ message: string }> {
    const result = await this.authService.logout(logoutDto);
    return { message: result };
  }

  @Post('verify-forget-password-token')
  verifyForgetPassword(
    @Body() verifyForgetPasswordDto: VerifyForgetPasswordDto,
  ) {
    return this.authService.verifyForgetPasswordToken(verifyForgetPasswordDto);
  }

  @Get('me')
  async me(@Query('username') username: string, @Query('sub') sub: number) {
    return await this.authService.me(username, sub);
  }

  @Post('add-points')
  async addWalletPoints(@Body() addPointsDto: AddPointsDto): Promise<any> {
    const { email, id, points } = addPointsDto;

    if (!email && !id) {
      throw new BadRequestException('Email or ID must be provided.');
    }

    const user = await this.authService.findUserByEmailOrId(email, id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (points <= 0) {
      throw new BadRequestException('Points must be a positive number.');
    }

    const updatedUser = await this.authService.addWalletPoints(user, points);

    return updatedUser;
  }

  @Post('contact-us')
  contactUs(@Body() addPointsDto: any) {
    return {
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.',
    };
  }
}
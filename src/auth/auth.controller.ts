/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from './auth.guards';
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
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { Request, Response } from 'express';
import { IncomingMessage } from 'http';


@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    // private jwtService: JwtService

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
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(loginDto, res);
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred' });
    }
  }

  @Post('refreshToken')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    try {
      const cookies = req.headers.cookie.split(';').reduce((cookies: any, cookie: string) => {
        const [name, value] = cookie.trim().split('=');
        cookies[name] = value;
        return cookies;
      }, {});

      const refreshToken = cookies.refresh_token;
      const result = await this.authService.refreshToken(refreshToken, res);
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred' });
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
    console.log("RESENDOTPPPPPPPPP*******", resendOtpDto);
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
    console.log("Me-Error-controller***************************")

    return await this.authService.me(username, sub);
  }

  @Post('add-points')
  async addWalletPoints(@Body() addPointsDto: any) {
    // Extract the user's email and points from the request body
    const { email, id, points } = addPointsDto;

    // Get the user
    const user = await this.authService.me(email, id);

    // Add points to the user's wallet
    user.walletPoints += points;

    // Save the updated user
    await this.authService.save(user);

    // Return the updated user
    return user;
  }


  @Post('contact-us')
  contactUs(@Body() addPointsDto: any) {
    return {
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.',
    };
  }
}
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  OtpDto,
  RegisterDto,
  ResetPasswordDto,
  ResendOtpDto,
  SocialLoginDto,
  VerifyForgetPasswordDto,
  VerifyOtpDto,
  AuthResponse,
} from './dto/create-auth.dto';
import { AddPointsDto } from './dto/addWalletPoints.dto';
import { AuthGuard } from './auth-helper/auth.guards';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './auth-helper/session.service';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  jwtService: JwtService;
  sessionService: SessionService;

  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      this.logger.error('Registration failed', error.stack);
      throw new HttpException('Registration failed. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      return await this.authService.verifyOtp(verifyOtpDto);
    } catch (error) {
      this.logger.error('OTP verification failed', error.stack);
      throw new UnauthorizedException('Invalid OTP.');
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('token')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      this.logger.error('Login error:', error.stack);
      throw new UnauthorizedException('Login failed: Invalid credentials.');
    }
  }

  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    try {
      // Verify the refresh token using the refresh secret
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_SECRET,
      });

      console.log('payload', payload);

      // Ensure that payload contains required fields
      if (!payload || !payload.username || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Find the user using the payload from the refresh token
      const user = await this.authService.findUserByEmailOrId(payload.username, payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access and refresh tokens
      const tokens = await this.authService.signIn(user);
      return tokens;
    } catch (error) {
      // Handle errors and return a proper response
      console.error('Error refreshing token:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('send-otp-code')
  async sendOtpCode(@Body() otpDto: OtpDto) {
    try {
      return await this.authService.sendOtpCode(otpDto);
    } catch (error) {
      this.logger.error('Failed to send OTP code', error.stack);
      throw new HttpException('Failed to send OTP code. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-otp-code')
  async verifyOtpCode(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      return await this.authService.verifyOtpCode(verifyOtpDto);
    } catch (error) {
      this.logger.error('OTP code verification failed', error.stack);
      throw new UnauthorizedException('Invalid OTP code.');
    }
  }

  @Post('forget-password')
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    try {
      return await this.authService.forgetPassword(forgetPasswordDto);
    } catch (error) {
      this.logger.error('Forgot password request failed', error.stack);
      throw new HttpException('Failed to process forget password request. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      return await this.authService.resetPassword(resetPasswordDto);
    } catch (error) {
      this.logger.error('Reset password failed', error.stack);
      throw new HttpException('Failed to reset password. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    try {
      return await this.authService.resendOtp(resendOtpDto);
    } catch (error) {
      this.logger.error('Failed to resend OTP', error.stack);
      throw new HttpException('Failed to resend OTP. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    try {
      return await this.authService.changePassword(changePasswordDto);
    } catch (error) {
      this.logger.error('Change password failed', error.stack);
      throw new HttpException('Failed to change password. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-forget-password-token')
  async verifyForgetPassword(@Body() verifyForgetPasswordDto: VerifyForgetPasswordDto) {
    try {
      return await this.authService.verifyForgetPasswordToken(verifyForgetPasswordDto);
    } catch (error) {
      this.logger.error('Verify forget password token failed', error.stack);
      throw new UnauthorizedException('Invalid token.');
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() logoutDto: LoginDto): Promise<{ message: string }> {
    try {
      const result = await this.authService.logout(logoutDto);
      await this.sessionService.invalidateSession(logoutDto.id);
      return { message: result };
    } catch (error) {
      this.logger.error('Logout failed', error.stack);
      throw new HttpException('Failed to logout. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('social-login-token')
  async socialLogin(@Body() socialLoginDto: SocialLoginDto): Promise<AuthResponse> {
    try {
      return await this.authService.socialLogin(socialLoginDto);
    } catch (error) {
      this.logger.error('Social login failed', error.stack);
      throw new HttpException('Social login failed. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Query('username') username?: string, @Query('sub') sub?: number) {
    try {
      return await this.authService.me(username, sub);
    } catch (error) {
      this.logger.error('Failed to get user details', error.stack);
      throw new HttpException('Failed to retrieve user details. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('add-points')
  async addWalletPoints(@Body() addPointsDto: AddPointsDto): Promise<any> {
    const { email, id, points } = addPointsDto;

    if (!email && !id) {
      throw new BadRequestException('Email or ID must be provided.');
    }

    if (points <= 0) {
      throw new BadRequestException('Points must be a positive number.');
    }

    try {
      const user = await this.authService.findUserByEmailOrId(email, id);
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const updatedUser = await this.authService.addWalletPoints(user, points);
      return updatedUser;
    } catch (error) {
      this.logger.error('Failed to add wallet points', error.stack);
      throw new HttpException('Failed to add wallet points. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('contact-us')
  contactUs() {
    return {
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.',
    };
  }

  @Post('guest-login')
  @HttpCode(HttpStatus.OK)
  async guestLogin(@Body() loginDto: { phoneNumber?: string; email?: string }) {
    if (!loginDto.phoneNumber && !loginDto.email) {
      throw new BadRequestException('Phone number or email is required.');
    }

    try {
      let token: any;

      if (loginDto.phoneNumber) {
        await this.authService.requestSmsVerification(loginDto.phoneNumber);
        token = await this.authService.signIn({ phoneNumber: loginDto.phoneNumber });
      } else if (loginDto.email) {
        await this.authService.requestEmailVerification(loginDto.email);
        token = await this.authService.signIn({ email: loginDto.email });
      }

      return { token, message: 'Verification requested. Please check your device or email.' };
    } catch (error) {
      this.logger.error('Guest login failed', error.stack);
      throw new HttpException('Guest login failed. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-sms')
  @HttpCode(HttpStatus.OK)
  async verifySms(@Body() verifyDto: { phoneNumber: string; code: string }) {
    try {
      const isVerified = await this.authService.verifySmsCode(verifyDto.phoneNumber, verifyDto.code);
      if (!isVerified) {
        throw new UnauthorizedException('Invalid SMS code.');
      }

      const token = await this.authService.signIn({ phoneNumber: verifyDto.phoneNumber });
      return { token, message: 'SMS code verified successfully.' };
    } catch (error) {
      this.logger.error('SMS verification failed', error.stack);
      throw new HttpException('SMS verification failed. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyDto: { email: string; code: string }) {
    try {
      const isVerified = await this.authService.verifyEmailCode(verifyDto.email, verifyDto.code);
      if (!isVerified) {
        throw new UnauthorizedException('Invalid email verification code.');
      }

      const token = await this.authService.signIn({ email: verifyDto.email });
      return { token, message: 'Email code verified successfully.' };
    } catch (error) {
      this.logger.error('Email verification failed', error.stack);
      throw new HttpException('Email verification failed. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

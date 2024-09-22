import { AuthService } from './auth.service';
import { ChangePasswordDto, ForgetPasswordDto, LoginDto, OtpDto, RegisterDto, ResetPasswordDto, ResendOtpDto, SocialLoginDto, VerifyForgetPasswordDto, VerifyOtpDto, AuthResponse } from './dto/create-auth.dto';
import { AddPointsDto } from './dto/addWalletPoints.dto';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './auth-helper/session.service';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    private readonly sessionService;
    private readonly logger;
    constructor(authService: AuthService, jwtService: JwtService, sessionService: SessionService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        access_token: string;
        success: boolean;
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
    }>;
    sendOtpCode(otpDto: OtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtpCode(verifyOtpDto: VerifyOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    forgetPassword(forgetPasswordDto: ForgetPasswordDto): Promise<import("./dto/create-auth.dto").CoreResponse>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<import("./dto/create-auth.dto").CoreResponse>;
    resendOtp(resendOtpDto: ResendOtpDto): Promise<{
        message: string;
    }>;
    changePassword(changePasswordDto: ChangePasswordDto): Promise<import("./dto/create-auth.dto").CoreResponse>;
    verifyForgetPassword(verifyForgetPasswordDto: VerifyForgetPasswordDto): Promise<import("./dto/create-auth.dto").CoreResponse>;
    logout(logoutDto: LoginDto): Promise<{
        message: string;
    }>;
    socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponse>;
    me(username?: string, sub?: number): Promise<import("../users/entities/user.entity").User>;
    addWalletPoints(addPointsDto: AddPointsDto): Promise<any>;
    contactUs(): {
        success: boolean;
        message: string;
    };
    guestLogin(loginDto: {
        phoneNumber?: string;
        email?: string;
    }): Promise<{
        token: any;
        message: string;
    }>;
    verifySms(verifyDto: {
        phoneNumber: string;
        code: string;
    }): Promise<{
        token: {
            access_token: string;
            refresh_token: string;
        };
        message: string;
    }>;
    verifyEmail(verifyDto: {
        email: string;
        code: string;
    }): Promise<{
        token: {
            access_token: string;
            refresh_token: string;
        };
        message: string;
    }>;
}

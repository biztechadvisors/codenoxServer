import { AuthResponse, ChangePasswordDto, ForgetPasswordDto, LoginDto, CoreResponse, RegisterDto, ResetPasswordDto, VerifyForgetPasswordDto, SocialLoginDto, VerifyOtpDto, OtpDto, ResendOtpDto } from './dto/create-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import { NotificationService } from 'src/notifications/services/notifications.service';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { SessionService } from './auth-helper/session.service';
import { AnalyticsService } from '../analytics/analytics.service';
export declare class AuthService {
    private readonly userRepository;
    private readonly permissionRepository;
    private readonly cacheManager;
    private readonly jwtService;
    private readonly mailService;
    private readonly sessionService;
    private readonly analyticsService;
    private readonly notificationService;
    private readonly configService;
    private readonly logger;
    private readonly twilioClient;
    private readonly twilioVerifyServiceSid;
    private readonly otpExpiryTime;
    private emailVerificationCodes;
    constructor(userRepository: Repository<User>, permissionRepository: Repository<Permission>, cacheManager: Cache, jwtService: JwtService, mailService: MailService, sessionService: SessionService, analyticsService: AnalyticsService, notificationService: NotificationService, configService: ConfigService);
    private sendSms;
    generateOtp(length?: number): Promise<string>;
    destroyOtp(user: User): Promise<void>;
    resendOtp(resendOtpDto: ResendOtpDto): Promise<{
        message: string;
    }>;
    signIn(user: any): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    getPermissions(typeName: string): Promise<any[]>;
    register(createUserInput: RegisterDto): Promise<{
        message: string;
    }>;
    private validateInput;
    private findExistingUser;
    private handleExistingUser;
    private getPermission;
    private buildUser;
    private handleCreatedByLogic;
    private handleNewUserRegistration;
    private sendRegistrationNotification;
    private getNotificationTitle;
    private getNotificationMessage;
    private handleRegistrationError;
    verifyOtp(verifyOtpInput: VerifyOtpDto): Promise<{
        access_token: string;
        success: boolean;
        message: string;
    }>;
    private verifyPhoneOtp;
    private isOtpValid;
    private getUserByPhoneNumber;
    private createNewUser;
    login(loginInput: LoginDto): Promise<AuthResponse>;
    logout(logoutDto: LoginDto): Promise<string>;
    verifyOtpCode(verifyOtpInput: any): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(changePasswordInput: ChangePasswordDto): Promise<CoreResponse>;
    forgetPassword(forgetPasswordInput: ForgetPasswordDto): Promise<CoreResponse>;
    verifyForgetPasswordToken(verifyForgetPasswordTokenInput: VerifyForgetPasswordDto): Promise<CoreResponse>;
    resetPassword(resetPasswordInput: ResetPasswordDto): Promise<CoreResponse>;
    socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponse>;
    private getProfileFromProvider;
    private getGoogleProfile;
    private getFacebookProfile;
    sendOtpCode(otpInput: OtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getUser({ id }: any): Promise<User | undefined>;
    getUsers({ text, first, page }: any): Promise<{
        data: User[];
        paginatorInfo: any;
    }>;
    me(email: string, id: number): Promise<User>;
    private getRelations;
    updateUser(id: number, updateUserInput: any): Promise<User>;
    findUserByEmailOrId(email: string, id: string): Promise<User | undefined>;
    addWalletPoints(user: User, points: number): Promise<User>;
    requestSmsVerification(phoneNumber: string): Promise<void>;
    verifySmsCode(phoneNumber: string, code: string): Promise<boolean>;
    private destroyEmailOtp;
    requestEmailVerification(email: string): Promise<void>;
    verifyEmailCode(email: string, code: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

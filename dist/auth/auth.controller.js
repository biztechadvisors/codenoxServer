"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const create_auth_dto_1 = require("./dto/create-auth.dto");
const addWalletPoints_dto_1 = require("./dto/addWalletPoints.dto");
const jwt_1 = require("@nestjs/jwt");
const session_service_1 = require("./auth-helper/session.service");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, jwtService, sessionService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.sessionService = sessionService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async register(registerDto) {
        try {
            return await this.authService.register(registerDto);
        }
        catch (error) {
            this.logger.error('Registration failed', error.stack);
            throw new common_1.HttpException('Registration failed. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyOtp(verifyOtpDto) {
        try {
            return await this.authService.verifyOtp(verifyOtpDto);
        }
        catch (error) {
            this.logger.error('OTP verification failed', error.stack);
            throw new common_1.UnauthorizedException('Invalid OTP.');
        }
    }
    async login(loginDto) {
        try {
            return await this.authService.login(loginDto);
        }
        catch (error) {
            this.logger.error('Login error:', error.stack);
            throw new common_1.UnauthorizedException('Login failed: Invalid credentials.');
        }
    }
    async refreshToken(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.REFRESH_SECRET,
            });
            if (!payload || !payload.username || !payload.sub) {
                throw new common_1.UnauthorizedException('Invalid token payload');
            }
            const isValidSession = await this.sessionService.validateSession(payload.sub, refreshToken);
            if (!isValidSession) {
                throw new common_1.UnauthorizedException('Invalid session token');
            }
            const newAccessToken = await this.jwtService.signAsync({
                username: payload.username,
                sub: payload.sub,
            }, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: '4m',
            });
            return { access_token: newAccessToken };
        }
        catch (error) {
            console.error('Error refreshing token:', error);
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async sendOtpCode(otpDto) {
        try {
            return await this.authService.sendOtpCode(otpDto);
        }
        catch (error) {
            this.logger.error('Failed to send OTP code', error.stack);
            throw new common_1.HttpException('Failed to send OTP code. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyOtpCode(verifyOtpDto) {
        try {
            return await this.authService.verifyOtpCode(verifyOtpDto);
        }
        catch (error) {
            this.logger.error('OTP code verification failed', error.stack);
            throw new common_1.UnauthorizedException('Invalid OTP code.');
        }
    }
    async forgetPassword(forgetPasswordDto) {
        try {
            return await this.authService.forgetPassword(forgetPasswordDto);
        }
        catch (error) {
            this.logger.error('Forgot password request failed', error.stack);
            throw new common_1.HttpException('Failed to process forget password request. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resetPassword(resetPasswordDto) {
        try {
            return await this.authService.resetPassword(resetPasswordDto);
        }
        catch (error) {
            this.logger.error('Reset password failed', error.stack);
            throw new common_1.HttpException('Failed to reset password. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resendOtp(resendOtpDto) {
        try {
            return await this.authService.resendOtp(resendOtpDto);
        }
        catch (error) {
            this.logger.error('Failed to resend OTP', error.stack);
            throw new common_1.HttpException('Failed to resend OTP. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async changePassword(changePasswordDto) {
        try {
            return await this.authService.changePassword(changePasswordDto);
        }
        catch (error) {
            this.logger.error('Change password failed', error.stack);
            throw new common_1.HttpException('Failed to change password. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyForgetPassword(verifyForgetPasswordDto) {
        try {
            return await this.authService.verifyForgetPasswordToken(verifyForgetPasswordDto);
        }
        catch (error) {
            this.logger.error('Verify forget password token failed', error.stack);
            throw new common_1.UnauthorizedException('Invalid token.');
        }
    }
    async logout(logoutDto) {
        try {
            const result = await this.authService.logout(logoutDto);
            await this.sessionService.invalidateSession(logoutDto.id);
            return { message: result };
        }
        catch (error) {
            this.logger.error('Logout failed', error.stack);
            throw new common_1.HttpException('Failed to logout. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async socialLogin(socialLoginDto) {
        try {
            return await this.authService.socialLogin(socialLoginDto);
        }
        catch (error) {
            this.logger.error('Social login failed', error.stack);
            throw new common_1.HttpException('Social login failed. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async me(username, sub) {
        try {
            return await this.authService.me(username, sub);
        }
        catch (error) {
            this.logger.error('Failed to get user details', error.stack);
            throw new common_1.HttpException('Failed to retrieve user details. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async addWalletPoints(addPointsDto) {
        const { email, id, points } = addPointsDto;
        if (!email && !id) {
            throw new common_1.BadRequestException('Email or ID must be provided.');
        }
        if (points <= 0) {
            throw new common_1.BadRequestException('Points must be a positive number.');
        }
        try {
            const user = await this.authService.findUserByEmailOrId(email, id);
            if (!user) {
                throw new common_1.NotFoundException('User not found.');
            }
            const updatedUser = await this.authService.addWalletPoints(user, points);
            return updatedUser;
        }
        catch (error) {
            this.logger.error('Failed to add wallet points', error.stack);
            throw new common_1.HttpException('Failed to add wallet points. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    contactUs() {
        return {
            success: true,
            message: 'Thank you for contacting us. We will get back to you soon.',
        };
    }
    async guestLogin(loginDto) {
        if (!loginDto.phoneNumber && !loginDto.email) {
            throw new common_1.BadRequestException('Phone number or email is required.');
        }
        try {
            let token;
            if (loginDto.phoneNumber) {
                await this.authService.requestSmsVerification(loginDto.phoneNumber);
                token = await this.authService.signIn({ phoneNumber: loginDto.phoneNumber });
            }
            else if (loginDto.email) {
                await this.authService.requestEmailVerification(loginDto.email);
                token = await this.authService.signIn({ email: loginDto.email });
            }
            return { token, message: 'Verification requested. Please check your device or email.' };
        }
        catch (error) {
            this.logger.error('Guest login failed', error.stack);
            throw new common_1.HttpException('Guest login failed. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifySms(verifyDto) {
        try {
            const isVerified = await this.authService.verifySmsCode(verifyDto.phoneNumber, verifyDto.code);
            if (!isVerified) {
                throw new common_1.UnauthorizedException('Invalid SMS code.');
            }
            const token = await this.authService.signIn({ phoneNumber: verifyDto.phoneNumber });
            return { token, message: 'SMS code verified successfully.' };
        }
        catch (error) {
            this.logger.error('SMS verification failed', error.stack);
            throw new common_1.HttpException('SMS verification failed. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyEmail(verifyDto) {
        try {
            const isVerified = await this.authService.verifyEmailCode(verifyDto.email, verifyDto.code);
            if (!isVerified) {
                throw new common_1.UnauthorizedException('Invalid email verification code.');
            }
            const token = await this.authService.signIn({ email: verifyDto.email });
            return { token, message: 'Email code verified successfully.' };
        }
        catch (error) {
            this.logger.error('Email verification failed', error.stack);
            throw new common_1.HttpException('Email verification failed. Please try again later.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
__decorate([
    (0, common_1.Post)('register'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('token'),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: require("./dto/create-auth.dto").AuthResponse }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('send-otp-code'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.OtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtpCode", null);
__decorate([
    (0, common_1.Post)('verify-otp-code'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtpCode", null);
__decorate([
    (0, common_1.Post)('forget-password'),
    openapi.ApiResponse({ status: 201, type: require("./dto/create-auth.dto").CoreResponse }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.ForgetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgetPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    openapi.ApiResponse({ status: 201, type: require("./dto/create-auth.dto").CoreResponse }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('resend-otp'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.ResendOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOtp", null);
__decorate([
    (0, common_1.Post)('change-password'),
    openapi.ApiResponse({ status: 201, type: require("./dto/create-auth.dto").CoreResponse }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('verify-forget-password-token'),
    openapi.ApiResponse({ status: 201, type: require("./dto/create-auth.dto").CoreResponse }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.VerifyForgetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyForgetPassword", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('logout'),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('social-login-token'),
    openapi.ApiResponse({ status: 201, type: require("./dto/create-auth.dto").AuthResponse }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auth_dto_1.SocialLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "socialLogin", null);
__decorate([
    (0, common_1.Get)('me'),
    openapi.ApiResponse({ status: 200, type: require("../users/entities/user.entity").User }),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('add-points'),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addWalletPoints_dto_1.AddPointsDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addWalletPoints", null);
__decorate([
    (0, common_1.Post)('contact-us'),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "contactUs", null);
__decorate([
    (0, common_1.Post)('guest-login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "guestLogin", null);
__decorate([
    (0, common_1.Post)('verify-sms'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifySms", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService,
        session_service_1.SessionService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const mail_service_1 = require("../mail/mail.service");
const typeorm_2 = require("typeorm");
const permission_entity_1 = require("../permission/entities/permission.entity");
const twilio_1 = __importDefault(require("twilio"));
const notifications_service_1 = require("../notifications/services/notifications.service");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
const session_service_1 = require("./auth-helper/session.service");
const analytics_service_1 = require("../analytics/analytics.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, permissionRepository, jwtService, mailService, sessionService, analyticsService, notificationService, configService) {
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.sessionService = sessionService;
        this.analyticsService = analyticsService;
        this.notificationService = notificationService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.otpExpiryTime = 60 * 1000;
        this.emailVerificationCodes = new Map();
        this.twilioVerifyServiceSid = this.configService.get('TWILIO_VERIFY_SERVICE_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.twilioClient = (0, twilio_1.default)(this.configService.get('TWILIO_ACCOUNT_SID'), authToken);
    }
    async sendSms(phoneNumber, message) {
        try {
            await this.twilioClient.messages.create({
                to: phoneNumber,
                from: '+19383560164',
                body: message,
            });
            this.logger.log(`SMS sent successfully to: ${phoneNumber}`);
        }
        catch (error) {
            this.logger.error('Failed to send SMS:', error.message);
            throw new common_1.HttpException('Failed to send SMS.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateOtp(length = 6) {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * digits.length);
            otp += digits[randomIndex];
        }
        return otp.toString();
    }
    async destroyOtp(user) {
        try {
            user.otp = null;
            await this.userRepository.save(user);
        }
        catch (error) {
            this.logger.error('Error destroying OTP:', error);
            throw new common_1.HttpException('Failed to destroy OTP.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resendOtp(resendOtpDto) {
        try {
            const user = await this.userRepository.findOne({ where: { email: resendOtpDto.email } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const otp = await this.generateOtp();
            user.otp = parseInt(otp);
            user.created_at = new Date();
            await this.userRepository.save(user);
            await this.mailService.sendUserConfirmation(user, otp.toString());
            return { message: 'OTP resent successfully.' };
        }
        catch (error) {
            console.error('Resend OTP error:', error);
            throw new Error('Failed to resend OTP. Please try again.');
        }
    }
    async signIn(user) {
        if (!user || !user.id) {
            throw new common_1.UnauthorizedException('Invalid user credentials.');
        }
        try {
            const tokenPayload = {
                sub: user.id,
                username: user.email || user.phoneNumber,
            };
            const accessToken = await this.jwtService.signAsync(tokenPayload, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: '4m',
            });
            const refreshToken = await this.jwtService.signAsync(tokenPayload, {
                secret: process.env.REFRESH_SECRET,
                expiresIn: '7d',
            });
            await this.sessionService.storeSession(user.id, refreshToken);
            return { access_token: accessToken, refresh_token: refreshToken };
        }
        catch (error) {
            this.logger.error('SignIn error:', error);
            throw new common_1.UnauthorizedException('An error occurred during sign-in');
        }
    }
    async getPermissions(typeName) {
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
    async register(createUserInput) {
        try {
            this.validateInput(createUserInput);
            const existingUser = await this.findExistingUser(createUserInput);
            if (existingUser) {
                return await this.handleExistingUser(existingUser);
            }
            const permission = await this.getPermission(createUserInput);
            const hashedPassword = createUserInput.password
                ? await bcrypt.hash(createUserInput.password, 12)
                : null;
            const userData = this.buildUser(createUserInput, hashedPassword, permission);
            if (createUserInput.createdBy) {
                await this.handleCreatedByLogic(createUserInput, userData);
            }
            else {
                await this.handleNewUserRegistration(createUserInput, userData);
            }
            const user = await this.userRepository.save(userData);
            await this.sendRegistrationNotification(userData);
            if (createUserInput.createdBy && user) {
                await this.analyticsService.updateAnalytics(undefined, undefined, undefined, user);
                return { message: 'User registered successfully.' };
            }
            else {
                return { message: 'Registered successfully. OTP sent to your email.' };
            }
        }
        catch (error) {
            this.logger.error('Registration error:', error);
            this.handleRegistrationError(error);
        }
    }
    validateInput(createUserInput) {
        if (!createUserInput.email && !createUserInput.contact) {
            throw new common_1.BadRequestException('Either email or phone number is required.');
        }
    }
    async findExistingUser(createUserInput) {
        return await this.userRepository.findOne({
            where: createUserInput.email
                ? { email: createUserInput.email }
                : { contact: createUserInput.contact },
        });
    }
    async handleExistingUser(existingUser) {
        var _a;
        if (!existingUser.isVerified) {
            const otp = await this.generateOtp();
            existingUser.otp = parseInt(otp);
            existingUser.created_at = new Date();
            await this.userRepository.save(existingUser);
            if (![user_entity_1.UserType.Dealer, user_entity_1.UserType.Company, user_entity_1.UserType.Staff].includes((_a = existingUser.permission) === null || _a === void 0 ? void 0 : _a.type_name)) {
                await this.mailService.sendUserConfirmation(existingUser, otp.toString());
            }
            return { message: 'OTP resent to your email.' };
        }
        return { message: 'User already registered and verified.' };
    }
    async getPermission(createUserInput) {
        if (!createUserInput.permission)
            return null;
        const permission = await this.permissionRepository.findOne({
            where: { permission_name: (0, typeorm_2.ILike)(`%${createUserInput.permission.permission_name}%`) },
        });
        if (!permission) {
            throw new common_1.BadRequestException('Invalid permission type.');
        }
        return permission;
    }
    buildUser(createUserInput, hashedPassword, permission) {
        const userData = new user_entity_1.User();
        userData.name = createUserInput.name || null;
        userData.email = createUserInput.email || null;
        userData.contact = createUserInput.contact || null;
        userData.password = hashedPassword;
        userData.created_at = new Date();
        userData.createdBy = createUserInput.createdBy || null;
        userData.isVerified = !!createUserInput.createdBy;
        userData.permission = permission;
        return userData;
    }
    async handleCreatedByLogic(createUserInput, userData) {
        var _a;
        const parentUser = await this.userRepository.findOne({
            where: { id: createUserInput.createdBy.id },
            relations: ['permission', 'managed_shop'],
        });
        if (!parentUser) {
            throw new common_1.BadRequestException('Invalid creator user.');
        }
        if (parentUser.permission.type_name === user_entity_1.UserType.Company && ((_a = userData.permission) === null || _a === void 0 ? void 0 : _a.type_name) === user_entity_1.UserType.Dealer) {
            const existingDealerCount = await this.userRepository.createQueryBuilder('user')
                .innerJoin('user.permission', 'permission')
                .where('user.createdBy = :createdBy', { createdBy: parentUser.id })
                .andWhere('permission.type_name = :type_name', { type_name: user_entity_1.UserType.Dealer })
                .getCount();
            if (existingDealerCount >= parentUser.managed_shop.dealerCount) {
                throw new common_1.BadRequestException('Dealer count limit reached.');
            }
        }
    }
    async handleNewUserRegistration(createUserInput, userData) {
        const otpToken = await this.generateOtp();
        if (createUserInput.email) {
            userData.otp = parseInt(otpToken);
            await this.mailService.sendUserConfirmation(userData, otpToken.toString());
        }
        else if (createUserInput.contact) {
            const otpDto = { phone_number: createUserInput.contact };
            const response = await this.sendOtpCode(otpDto);
            if (!response.success) {
                throw new common_1.InternalServerErrorException('Error sending OTP');
            }
        }
    }
    async sendRegistrationNotification(userData) {
        const notificationTitle = this.getNotificationTitle(userData);
        const notificationMessage = this.getNotificationMessage(userData);
        await this.notificationService.createNotification(userData.id, notificationTitle, notificationMessage);
    }
    getNotificationTitle(userData) {
        var _a, _b;
        return ((_a = userData.permission) === null || _a === void 0 ? void 0 : _a.type_name) === user_entity_1.UserType.Dealer
            ? 'Welcome Dealer!'
            : ((_b = userData.permission) === null || _b === void 0 ? void 0 : _b.type_name) === user_entity_1.UserType.Staff
                ? 'Welcome Staff!'
                : 'Welcome!';
    }
    getNotificationMessage(userData) {
        var _a, _b;
        return ((_a = userData.permission) === null || _a === void 0 ? void 0 : _a.type_name) === user_entity_1.UserType.Dealer
            ? 'You have been successfully registered as a dealer.'
            : ((_b = userData.permission) === null || _b === void 0 ? void 0 : _b.type_name) === user_entity_1.UserType.Staff
                ? 'You have been successfully registered as a staff member.'
                : 'Your account has been successfully created.';
    }
    handleRegistrationError(error) {
        if (error instanceof common_1.BadRequestException || error instanceof common_1.ConflictException) {
            throw error;
        }
        throw new common_1.HttpException('Registration failed. Please try again.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    async verifyOtp(verifyOtpInput) {
        const { phone_number, email, code } = verifyOtpInput;
        let user = null;
        if (phone_number) {
            const phoneOtpVerification = await this.verifyPhoneOtp(phone_number, code.toString());
            if (!phoneOtpVerification.success) {
                return { success: false, message: phoneOtpVerification.message, access_token: null };
            }
            user = await this.getUserByPhoneNumber(phone_number);
        }
        else if (email) {
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
        }
        else {
            return { success: false, message: 'Invalid input. Either phone number or email is required.', access_token: null };
        }
        const payload = { sub: user.id, email: user.email };
        const access_token = this.jwtService.sign(payload);
        await this.analyticsService.updateAnalytics(undefined, undefined, undefined, user);
        return { success: true, message: 'OTP verification successful!', access_token };
    }
    async verifyPhoneOtp(phone_number, code) {
        try {
            const verificationCheck = await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
                .verificationChecks.create({ to: phone_number, code: code.toString() });
            if (verificationCheck.status === 'approved') {
                const user = await this.getUserByPhoneNumber(phone_number);
                if (user) {
                    user.isVerified = true;
                    await this.userRepository.save(user);
                }
                else {
                    await this.createNewUser(phone_number);
                }
                await this.sendSms(phone_number, 'Welcome to our service! We are glad to have you with us.');
                return { success: true, message: 'OTP verification successful' };
            }
            else {
                return { success: false, message: 'OTP verification failed' };
            }
        }
        catch (error) {
            this.logger.error('Failed to verify phone OTP:', error.message);
            throw new common_1.HttpException('Failed to verify OTP.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    isOtpValid(user, code) {
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
    async getUserByPhoneNumber(phone_number) {
        return await this.userRepository.findOne({ where: { contact: phone_number } });
    }
    async createNewUser(phone_number) {
        const user = this.userRepository.create({
            contact: phone_number,
            isVerified: true,
        });
        await this.userRepository.save(user);
        await this.sendSms(phone_number, 'Welcome to our service!');
    }
    async login(loginInput) {
        var _a, _b, _c;
        try {
            if (!loginInput.email && !loginInput.contact) {
                throw new common_1.BadRequestException('Email or contact is required.');
            }
            const user = await this.userRepository.findOne({
                where: loginInput.email
                    ? { email: loginInput.email }
                    : { contact: loginInput.contact },
                relations: ['permission', 'dealer'],
            });
            if (!user || !user.isVerified) {
                throw new common_1.UnauthorizedException('User not registered or not verified.');
            }
            if (loginInput.password) {
                const isMatch = await bcrypt.compare(loginInput.password, user.password);
                if (!isMatch) {
                    throw new common_1.UnauthorizedException('Invalid password.');
                }
            }
            else {
                throw new common_1.BadRequestException('Password is required.');
            }
            const { access_token, refresh_token } = await this.signIn(user);
            let formattedPermissions = [];
            if ((_a = user.permission) === null || _a === void 0 ? void 0 : _a.type_name) {
                const permissions = await this.getPermissions(user.permission.type_name);
                formattedPermissions = permissions.map(permission => ({
                    id: permission.id,
                    type_name: permission.type_name,
                    permission: permission.permission,
                }));
            }
            return {
                token: access_token,
                refreshToken: refresh_token,
                type_name: ((_b = formattedPermissions[0]) === null || _b === void 0 ? void 0 : _b.type_name) ? [formattedPermissions[0].type_name] : [],
                permissions: ((_c = formattedPermissions[0]) === null || _c === void 0 ? void 0 : _c.permission) || [],
            };
        }
        catch (error) {
            this.logger.error('Login error:', error.stack);
            throw new common_1.UnauthorizedException('Login failed. Please try again.');
        }
    }
    async logout(logoutDto) {
        const user = await this.userRepository.findOne({ where: { email: logoutDto.email } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        user.is_active = false;
        await this.userRepository.save(user);
        return 'User logged out successfully';
    }
    async verifyOtpCode(verifyOtpInput) {
        const { phone_number, email, token } = verifyOtpInput;
        if (phone_number) {
            try {
                const verificationCheck = await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
                    .verificationChecks.create({
                    to: phone_number,
                    code: token,
                });
                if (verificationCheck.status === 'approved') {
                    return {
                        success: true,
                        message: 'OTP verification successful',
                    };
                }
                else {
                    return {
                        success: false,
                        message: 'OTP verification failed',
                    };
                }
            }
            catch (error) {
                this.logger.error('Failed to verify OTP:', error.message);
                throw new common_1.HttpException('Failed to verify OTP.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        else if (email) {
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) {
                return { success: false, message: 'User not found.' };
            }
            const now = new Date();
            const otpExpiryTime = 5 * 60 * 1000;
            const hasOtpExpired = user.otp && user.created_at && now.getTime() - new Date(user.created_at).getTime() > otpExpiryTime;
            if (hasOtpExpired) {
                await this.destroyOtp(user);
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
    async changePassword(changePasswordInput) {
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
    async forgetPassword(forgetPasswordInput) {
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
    async verifyForgetPasswordToken(verifyForgetPasswordTokenInput) {
        const otpVerificationResult = await this.verifyOtpCode(verifyForgetPasswordTokenInput);
        if (otpVerificationResult.success) {
            return {
                success: true,
                message: 'OTP verification successful, you can proceed to change the password.',
            };
        }
        else {
            return {
                success: false,
                message: 'OTP verification failed.',
            };
        }
    }
    async resetPassword(resetPasswordInput) {
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
        }
        else {
            return {
                success: false,
                message: 'OTP verification failed. Cannot change the password.',
            };
        }
    }
    async socialLogin(socialLoginDto) {
        var _a;
        try {
            const { provider, access_token } = socialLoginDto;
            const profile = await this.getProfileFromProvider(provider, access_token);
            let user = await this.userRepository.findOne({ where: { email: profile.email } });
            if (!user) {
                user = new user_entity_1.User();
                user.email = profile.email;
                user.name = profile.name || 'Unknown';
                user.isVerified = true;
                await this.userRepository.save(user);
            }
            const payload = { sub: user.id, email: user.email };
            const accessToken = await this.jwtService.signAsync(payload, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: '1h',
            });
            const refreshToken = await this.jwtService.signAsync(payload, {
                secret: process.env.REFRESH_SECRET,
                expiresIn: '7d',
            });
            const permissions = user.permission ? await this.getPermissions(user.permission.type_name) : [];
            return {
                token: accessToken,
                refreshToken: refreshToken,
                type_name: ((_a = user.permission) === null || _a === void 0 ? void 0 : _a.type_name) ? [user.permission.type_name] : [],
                permissions: permissions || [],
            };
        }
        catch (error) {
            this.logger.error('Social login error:', error.message);
            throw new common_1.HttpException('Failed to perform social login.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getProfileFromProvider(provider, accessToken) {
        switch (provider) {
            case 'google':
                return this.getGoogleProfile(accessToken);
            case 'facebook':
                return this.getFacebookProfile(accessToken);
            default:
                throw new common_1.HttpException('Unsupported social login provider', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getGoogleProfile(accessToken) {
        try {
            const response = await axios_1.default.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Google profile fetch error:', error.message);
            throw new common_1.HttpException('Failed to fetch Google profile.', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async getFacebookProfile(accessToken) {
        try {
            const response = await axios_1.default.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Facebook profile fetch error:', error.message);
            throw new common_1.HttpException('Failed to fetch Facebook profile.', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async sendOtpCode(otpInput) {
        const { phone_number } = otpInput;
        const formattedPhoneNumber = phone_number.startsWith('+') ? phone_number : `+${phone_number}`;
        try {
            console.log('Sending OTP to phone_number:', formattedPhoneNumber);
            await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
                .verifications.create({
                to: formattedPhoneNumber,
                channel: 'sms',
            });
            return {
                success: true,
                message: 'OTP sent successfully',
            };
        }
        catch (error) {
            this.logger.error('Failed to send OTP:', error.message);
            throw new common_1.HttpException('Failed to send OTP.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUser({ id }) {
        return this.userRepository.findOne(id);
    }
    async getUsers({ text, first, page }) {
        const startIndex = (page - 1) * first;
        const endIndex = page * first;
        let data;
        if (text) {
            data = await this.userRepository.find({ where: { name: text } });
        }
        else {
            data = await this.userRepository.find();
        }
        const results = data.slice(startIndex, endIndex);
        return {
            data: results,
            paginatorInfo: (data.length, page, first),
        };
    }
    async me(email, id) {
        const relations = await this.getRelations(email);
        const user = await this.userRepository.findOne({
            where: email ? { email } : { id },
            relations,
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with email ${email} and id ${id} not found`);
        }
        return user;
    }
    async getRelations(email) {
        const userWithDealer = await this.userRepository.findOne({
            where: { email, dealer: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
        });
        let relations;
        if (userWithDealer) {
            relations = ["profile", "adds", "owned_shops", "orders", "profile.socials", "adds.address", "permission", "dealer", "managed_shop", "createdBy", "createdBy.managed_shop"];
        }
        else {
            relations = ["profile", "adds", "owned_shops", "orders", "profile.socials", "adds.address", "permission", "managed_shop", "createdBy", "createdBy.managed_shop"];
        }
        return relations;
    }
    async updateUser(id, updateUserInput) {
        const user = await this.userRepository.findOne({ where: { id }, relations: ['permission', 'createdBy'] });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (updateUserInput.password) {
            updateUserInput.password = await bcrypt.hash(updateUserInput.password, 12);
        }
        if (updateUserInput.createdBy) {
            const parentUsr = await this.userRepository.findOne({
                where: { id: updateUserInput.createdBy },
                relations: ['permission'],
            });
            user.createdBy = parentUsr;
        }
        if (updateUserInput.permission) {
            const permission = await this.permissionRepository.findOne({
                where: { permission_name: (0, typeorm_2.ILike)(updateUserInput.permission) },
            });
        }
        Object.assign(user, updateUserInput);
        return this.userRepository.save(user);
    }
    async findUserByEmailOrId(email, id) {
        if (email) {
            return this.userRepository.findOne({ where: { email } });
        }
        else if (id) {
            return this.userRepository.findOne({ where: { id: parseInt(id) } });
        }
        throw new common_1.BadRequestException('Email or ID must be provided.');
    }
    async addWalletPoints(user, points) {
        user.walletPoints += points;
        try {
            await this.userRepository.save(user);
            return user;
        }
        catch (error) {
            console.error('Failed to update user wallet points:', error);
            throw new Error('Could not update wallet points. Please try again.');
        }
    }
    async requestSmsVerification(phoneNumber) {
        try {
            await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
                .verifications.create({
                to: phoneNumber,
                channel: 'sms',
            });
            this.logger.log(`SMS verification requested for: ${phoneNumber}`);
        }
        catch (error) {
            this.logger.error('Failed to request SMS verification:', error.message);
            throw new common_1.UnauthorizedException('Failed to request SMS verification.');
        }
    }
    async verifySmsCode(phoneNumber, code) {
        try {
            const verificationCheck = await this.twilioClient.verify.v2.services(this.twilioVerifyServiceSid)
                .verificationChecks.create({
                to: phoneNumber,
                code: code,
            });
            return verificationCheck.status === 'approved';
        }
        catch (error) {
            this.logger.error('Failed to verify SMS code:', error.message);
            throw new common_1.UnauthorizedException('Failed to verify SMS code.');
        }
    }
    destroyEmailOtp(email) {
        this.emailVerificationCodes.delete(email);
        this.logger.log(`OTP for ${email} has been destroyed`);
    }
    async requestEmailVerification(email) {
        try {
            const otp = (await this.generateOtp()).toString();
            const createdAt = new Date();
            this.emailVerificationCodes.set(email, { otp, createdAt });
            await this.mailService.sendUserConfirmation(email, otp);
            this.logger.log(`Email verification OTP sent to ${email}`);
        }
        catch (error) {
            this.logger.error('Failed to request email verification:', error.message);
            throw new common_1.UnauthorizedException('Failed to request email verification.');
        }
    }
    async verifyEmailCode(email, code) {
        try {
            const storedData = this.emailVerificationCodes.get(email);
            if (!storedData) {
                return { success: false, message: 'No OTP found. Please request a new one.' };
            }
            const { otp, createdAt } = storedData;
            const now = new Date();
            const otpExpiryTime = 60 * 1000;
            const hasOtpExpired = now.getTime() - createdAt.getTime() > otpExpiryTime;
            if (hasOtpExpired) {
                this.destroyEmailOtp(email);
                return { success: false, message: 'OTP has expired. Please request a new one.' };
            }
            if (otp !== code) {
                return { success: false, message: 'Invalid OTP.' };
            }
            this.destroyEmailOtp(email);
            return { success: true, message: 'OTP verification successful!' };
        }
        catch (error) {
            this.logger.error('Failed to verify email code:', error.message);
            throw new common_1.UnauthorizedException('Failed to verify email code.');
        }
    }
};
AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        mail_service_1.MailService,
        session_service_1.SessionService,
        analytics_service_1.AnalyticsService,
        notifications_service_1.NotificationService,
        config_1.ConfigService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const mail_module_1 = require("../mail/mail.module");
const notifications_module_1 = require("../notifications/notifications.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const user_entity_1 = require("../users/entities/user.entity");
const permission_entity_1 = require("../permission/entities/permission.entity");
const jwt_strategy_1 = require("./auth-helper/jwt.strategy");
const session_service_1 = require("./auth-helper/session.service");
const users_module_1 = require("../users/users.module");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, permission_entity_1.Permission]),
            users_module_1.UsersModule,
            mail_module_1.MailModule,
            notifications_module_1.NotificationModule,
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_ACCESS_SECRET,
                signOptions: { expiresIn: '4m' },
            }),
            cache_manager_1.CacheModule.register(),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, session_service_1.SessionService],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map
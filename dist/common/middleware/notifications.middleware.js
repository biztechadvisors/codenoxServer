"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsMiddleware = void 0;
const common_1 = require("@nestjs/common");
let NotificationsMiddleware = class NotificationsMiddleware {
    use(req, res, next) {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            console.log('User ID header missing');
            return res.status(400).send('User ID header missing');
        }
        console.log(`User ID from header: ${userId}`);
        req['userId'] = userId;
        next();
    }
};
NotificationsMiddleware = __decorate([
    (0, common_1.Injectable)()
], NotificationsMiddleware);
exports.NotificationsMiddleware = NotificationsMiddleware;
//# sourceMappingURL=notifications.middleware.js.map
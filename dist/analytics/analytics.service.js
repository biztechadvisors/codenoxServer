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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const user_entity_1 = require("../users/entities/user.entity");
const permission_entity_1 = require("../permission/entities/permission.entity");
const stocksOrd_entity_1 = require("../stocks/entities/stocksOrd.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const analytics_entity_1 = require("./entities/analytics.entity");
const refund_entity_1 = require("../refunds/entities/refund.entity");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(orderRepository, shopRepository, userRepository, analyticsRepository, refundRepository, permissionRepository, stocksSellOrdRepository, totalYearSaleByMonthRepository, cacheManager) {
        this.orderRepository = orderRepository;
        this.shopRepository = shopRepository;
        this.userRepository = userRepository;
        this.analyticsRepository = analyticsRepository;
        this.refundRepository = refundRepository;
        this.permissionRepository = permissionRepository;
        this.stocksSellOrdRepository = stocksSellOrdRepository;
        this.totalYearSaleByMonthRepository = totalYearSaleByMonthRepository;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    async findAll(shop_id, customerId, state) {
        var _a, _b, _c;
        try {
            const cacheKey = `analytics:${shop_id}:${customerId}:${state}`;
            const cachedResult = await this.cacheManager.get(cacheKey);
            if (cachedResult) {
                this.logger.log(`Cache hit for key: ${cacheKey}`);
                return cachedResult;
            }
            console.log("first: ", customerId + " " + shop_id);
            if (!customerId || !shop_id) {
                return { message: 'Customer ID or Shop ID is required' };
            }
            const [user, shop] = await Promise.all([
                customerId ? this.userRepository.findOne({ where: { id: customerId }, relations: ['permission'] }) : null,
                shop_id ? this.shopRepository.findOne({ where: { id: shop_id }, relations: ['owner', 'owner.permission'] }) : null
            ]);
            if (!user && !shop) {
                return { message: `User with ID ${customerId} and Shop with ID ${shop_id} not found` };
            }
            const userTypePermissionName = (_a = user === null || user === void 0 ? void 0 : user.permission) === null || _a === void 0 ? void 0 : _a.permission_name;
            const shopOwnerTypePermissionName = (_c = (_b = shop === null || shop === void 0 ? void 0 : shop.owner) === null || _b === void 0 ? void 0 : _b.permission) === null || _c === void 0 ? void 0 : _c.permission_name;
            if (!userTypePermissionName && !shopOwnerTypePermissionName) {
                return { message: 'Permission type not found for user or shop owner' };
            }
            const permissionName = userTypePermissionName || shopOwnerTypePermissionName;
            const userPermissions = await this.permissionRepository.findOne({ where: { permission_name: permissionName } });
            if (!userPermissions) {
                return { message: `User with ID ${customerId} does not have any permissions` };
            }
            const allowedPermissions = ['Admin', 'Super_Admin', 'Dealer', 'Company'];
            if (!allowedPermissions.includes(userPermissions.type_name)) {
                return { message: `User with ID ${customerId} does not have permission to access analytics` };
            }
            const ownerId = (user === null || user === void 0 ? void 0 : user.id) || (shop === null || shop === void 0 ? void 0 : shop.owner_id);
            const analyticsResponse = await Promise.all([
                this.calculateTotalRevenue(ownerId, userPermissions.type_name, state),
                this.calculateTotalRefunds(userPermissions.type_name, state),
                this.calculateTotalShops(ownerId, userPermissions.type_name, state),
                this.calculateTodaysRevenue(ownerId, userPermissions.type_name, state),
                this.calculateTotalOrders(ownerId, userPermissions.type_name, state),
                this.calculateNewCustomers(ownerId, userPermissions.type_name, state),
                this.calculateTotalYearSaleByMonth(ownerId, userPermissions.type_name, state)
            ]).then(([totalRevenue, totalRefunds, totalShops, todaysRevenue, totalOrders, newCustomers, totalYearSaleByMonth]) => ({
                totalRevenue,
                totalRefunds,
                totalShops,
                todaysRevenue,
                totalOrders,
                newCustomers,
                totalYearSaleByMonth
            }));
            await this.cacheManager.set(cacheKey, analyticsResponse, 60);
            this.logger.log(`Data cached with key: ${cacheKey}`);
            return analyticsResponse;
        }
        catch (error) {
            this.logger.error('Error fetching analytics:', error.message);
            return { message: `Error fetching analytics: ${error.message}` };
        }
    }
    async calculateTotalRevenue(userId, permissionName, state) {
        try {
            const createdByUsers = await this.userRepository.find({ where: { createdBy: { id: userId } } });
            const userIds = [userId, ...createdByUsers.map(u => u.id)];
            let totalRevenue = 0;
            if (permissionName === 'Dealer') {
                const queryBuilder = this.stocksSellOrdRepository.createQueryBuilder('order')
                    .innerJoin('order.shipping_address', 'shipping_address');
                if (state === null || state === void 0 ? void 0 : state.trim()) {
                    queryBuilder
                        .andWhere('shipping_address.state = :state', { state })
                        .andWhere('order.customer_id IN (:...userIds)', { userIds });
                }
                else {
                    queryBuilder.andWhere('order.customer_id IN (:...userIds)', { userIds });
                }
                const stockOrders = await queryBuilder.getMany();
                totalRevenue = stockOrders.reduce((sum, order) => { var _a; return sum + ((_a = order.total) !== null && _a !== void 0 ? _a : 0); }, 0);
            }
            else {
                const queryBuilder = this.orderRepository.createQueryBuilder('order')
                    .innerJoin('order.shipping_address', 'shipping_address');
                if (state === null || state === void 0 ? void 0 : state.trim()) {
                    queryBuilder
                        .andWhere('shipping_address.state = :state', { state })
                        .andWhere('order.customer_id IN (:...userIds)', { userIds });
                }
                else {
                    queryBuilder.andWhere('order.customer_id IN (:...userIds)', { userIds });
                }
                const orders = await queryBuilder.getMany();
                totalRevenue = orders.reduce((sum, order) => { var _a; return sum + ((_a = order.total) !== null && _a !== void 0 ? _a : 0); }, 0);
            }
            return totalRevenue;
        }
        catch (error) {
            this.logger.error('Error calculating total revenue:', { message: error.message, stack: error.stack });
            return 0;
        }
    }
    async calculateTotalRefunds(permissionName, state) {
        try {
            let query = this.refundRepository.createQueryBuilder('refund');
            if ((state === null || state === void 0 ? void 0 : state.trim()) && !['Company', 'Staff'].includes(permissionName)) {
                query = query.innerJoin('refund.order', 'order').innerJoin('order.shipping_address', 'shipping_address').where('shipping_address.state = :state', { state });
            }
            const result = await query.select('COUNT(DISTINCT refund.id)', 'totalRefunds').getRawOne();
            return (result === null || result === void 0 ? void 0 : result.totalRefunds) || 0;
        }
        catch (error) {
            this.logger.error('Error calculating total refunds:', error.message);
            return 0;
        }
    }
    async calculateTotalShops(userId, permissionName, state) {
        try {
            if (!['Company', 'Staff'].includes(permissionName))
                return 0;
            const queryBuilder = this.shopRepository.createQueryBuilder('shop')
                .innerJoin('shop.owner', 'owner')
                .innerJoin('shop.address', 'address')
                .andWhere('(owner.createdBy.id = :userId OR shop.owner_id = :userId)', { userId });
            if (state === null || state === void 0 ? void 0 : state.trim()) {
                queryBuilder.andWhere('address.state = :state', { state });
            }
            return await queryBuilder.getCount();
        }
        catch (error) {
            this.logger.error('Error calculating total shops:', error.message);
            return 0;
        }
    }
    async calculateTodaysRevenue(userId, permissionName, state) {
        try {
            const users = await this.userRepository.find({ where: { createdBy: { id: userId } } });
            const userIds = [userId, ...users.map((u) => u.id)];
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            let queryBuilder = this.orderRepository.createQueryBuilder('order')
                .innerJoin('order.shipping_address', 'shipping_address')
                .where('order.created_at BETWEEN :todayStart AND :todayEnd', { todayStart, todayEnd });
            if (state === null || state === void 0 ? void 0 : state.trim()) {
                if (['Company', 'Staff'].includes(permissionName)) {
                    queryBuilder.andWhere('shipping_address.state = :state', { state });
                }
                else {
                    queryBuilder.andWhere('shipping_address.state = :state AND order.customer_id IN (:...userIds)', { state, userIds });
                }
            }
            else if (!['super_admin', 'Admin'].includes(permissionName)) {
                queryBuilder.andWhere('order.customer_id IN (:...userIds)', { userIds });
            }
            const todayOrders = await queryBuilder.getMany();
            return todayOrders.reduce((total, order) => { var _a; return total + ((_a = order.total) !== null && _a !== void 0 ? _a : 0); }, 0);
        }
        catch (error) {
            this.logger.error("Error calculating today's revenue:", { message: error.message, stack: error.stack });
            return 0;
        }
    }
    async calculateTotalOrders(userId, permissionName, state) {
        try {
            const createdByUsers = await this.userRepository.find({ where: { createdBy: { id: userId } } });
            const userIds = [userId, ...createdByUsers.map(u => u.id)];
            let queryBuilder = this.orderRepository.createQueryBuilder('order')
                .innerJoin('order.shipping_address', 'shipping_address');
            if (state === null || state === void 0 ? void 0 : state.trim()) {
                queryBuilder
                    .andWhere('shipping_address.state = :state', { state })
                    .andWhere('order.customer_id IN (:...userIds)', { userIds });
            }
            else {
                queryBuilder.andWhere('order.customer_id IN (:...userIds)', { userIds });
            }
            return await queryBuilder.getCount();
        }
        catch (error) {
            this.logger.error('Error calculating total orders:', { message: error.message, stack: error.stack });
            return 0;
        }
    }
    async calculateNewCustomers(userId, permissionName, state) {
        try {
            if (permissionName === 'Dealer')
                return 0;
            const createdByUsers = await this.userRepository.find({
                where: { createdBy: { id: userId } },
            });
            const userIds = [userId, ...createdByUsers.map(u => u.id)];
            let queryBuilder = this.userRepository.createQueryBuilder('user');
            if (state === null || state === void 0 ? void 0 : state.trim()) {
                queryBuilder = queryBuilder.innerJoin('user.billing_address', 'billing_address').where('billing_address.state = :state', { state });
            }
            return await queryBuilder.andWhere('user.id IN (:...userIds)', { userIds }).getCount();
        }
        catch (error) {
            this.logger.error('Error calculating new customers:', error.message);
            return 0;
        }
    }
    async calculateTotalYearSaleByMonth(userId, permissionName, state) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
        return await Promise.all(months.map(async (month, index) => {
            const total = await this.calculateTotalSalesForMonth(index + 1, userId, permissionName, state);
            return { total, month };
        }));
    }
    async calculateTotalSalesForMonth(month, userId, permissionName, state) {
        try {
            const firstDayOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
            const lastDayOfMonth = new Date(new Date().getFullYear(), month, 0, 23, 59, 59, 999);
            let query = permissionName === user_entity_1.UserType.Dealer
                ? this.stocksSellOrdRepository.createQueryBuilder('order').innerJoin('order.shipping_address', 'shipping_address')
                : this.orderRepository.createQueryBuilder('order').innerJoin('order.shipping_address', 'shipping_address');
            query = query.where('order.created_at BETWEEN :firstDay AND :lastDay', {
                firstDay: firstDayOfMonth,
                lastDay: lastDayOfMonth,
            });
            const createdByUsers = await this.userRepository.find({ where: { createdBy: { id: userId } } });
            const userIds = [userId, ...createdByUsers.map(user => user.id)];
            if (state === null || state === void 0 ? void 0 : state.trim()) {
                if (!['Company', 'Staff'].includes(permissionName)) {
                    query = query.andWhere('order.customer_id IN (:...userIds) AND shipping_address.state = :state', { userIds, state });
                }
                else {
                    query = query.andWhere('shipping_address.state = :state', { state });
                }
            }
            else if (!['Company', 'Staff'].includes(permissionName)) {
                if (permissionName.includes(user_entity_1.UserType.Dealer)) {
                    query = query.andWhere('order.soldBy IN (:...userIds)', { userIds });
                }
                else {
                    query = query.andWhere('order.customer_id IN (:...userIds)', { userIds });
                }
            }
            const result = await query
                .select('SUM(order.total)', 'total')
                .getRawOne();
            return parseInt(result.total, 10) || 0;
        }
        catch (error) {
            console.error(`Error calculating total sales for month ${month}: ${error.message}`);
            return 0;
        }
    }
    async getTopUsersWithMaxOrders(userId) {
        try {
            const cacheKey = `top-users-with-max-orders:${userId}`;
            const cachedResult = await this.cacheManager.get(cacheKey);
            if (cachedResult) {
                this.logger.log(`Cache hit for key: ${cacheKey}`);
                return cachedResult;
            }
            const orderQueryBuilder = this.orderRepository.createQueryBuilder('order')
                .select(['customer', 'COUNT(order.id) AS orderCount'])
                .leftJoin('order.customer', 'customer')
                .groupBy('customer.createdBy.id')
                .having('orderCount > 0')
                .orderBy('orderCount', 'DESC')
                .take(10);
            if (userId) {
                const usrByIdUsers = await this.userRepository.find({
                    where: { createdBy: { id: userId } },
                });
                const userIds = [userId, ...usrByIdUsers.map(u => u.id)];
                if (userIds.length > 0) {
                    const result = await orderQueryBuilder
                        .andWhere('customer.createdBy.id IN (:...userIds)', { userIds })
                        .getRawMany();
                    const formattedResult = result.flatMap((m) => ({
                        userId: m.customer_id,
                        createdBy: m.customer_usrById,
                        name: m.customer_name,
                        email: m.customer_email,
                        phone: m.customer_contact,
                    }));
                    await this.cacheManager.set(cacheKey, formattedResult, 60);
                    this.logger.log(`Data cached with key: ${cacheKey}`);
                    return formattedResult;
                }
            }
            return [];
        }
        catch (error) {
            console.error('Error getting top users with max orders:', error.message);
            return [];
        }
    }
    async getTopDealer(userId) {
        try {
            const cacheKey = `top-dealers:${userId}`;
            const cachedResult = await this.cacheManager.get(cacheKey);
            if (cachedResult) {
                this.logger.log(`Cache hit for key: ${cacheKey}`);
                return cachedResult;
            }
            const dealerUsersQuery = (await this.userRepository.find({
                where: { createdBy: { id: Number(userId) } },
                relations: ['dealer'],
            })).filter((dlr) => dlr.dealer !== null).flatMap((usr) => usr.id);
            const usrByDealer = (await this.orderRepository.find({
                relations: ['customer', 'customer.createdBy'],
            })).filter((ordUsr) => dealerUsersQuery.includes(ordUsr.customer.createdBy.id));
            const ordersByDealers = await this.orderRepository
                .createQueryBuilder('order')
                .select('customer.id', 'customerId')
                .addSelect('COUNT(order.id)', 'orderCount')
                .leftJoin('order.customer', 'customer')
                .where('customer.createdBy IN (:...dealerUserIds)', { dealerUserIds: dealerUsersQuery })
                .groupBy('customer.id')
                .orderBy('orderCount', 'DESC')
                .getRawMany();
            const customerIds = ordersByDealers.map(order => order.customerId);
            const topDealers = await this.userRepository
                .createQueryBuilder('users')
                .select('users', 'users')
                .where('users.id IN (:...customerIds)', { customerIds })
                .groupBy('users.createdBy')
                .limit(5)
                .getRawMany();
            const formattedResult = topDealers.map((m) => ({
                userId: m.users_id,
                createdBy: m.users_usrById,
                name: m.users_name,
                email: m.users_email,
                phone: m.users_contact,
                dealerId: m.users_dealerId,
            }));
            await this.cacheManager.set(cacheKey, formattedResult, 60);
            this.logger.log(`Data cached with key: ${cacheKey}`);
            return formattedResult;
        }
        catch (error) {
            console.error('Error getting top dealers with max orders:', error.message);
            return [];
        }
    }
};
AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(analytics_entity_1.Analytics)),
    __param(4, (0, typeorm_1.InjectRepository)(refund_entity_1.Refund)),
    __param(5, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(6, (0, typeorm_1.InjectRepository)(stocksOrd_entity_1.StocksSellOrd)),
    __param(7, (0, typeorm_1.InjectRepository)(analytics_entity_1.TotalYearSaleByMonth)),
    __param(8, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], AnalyticsService);
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map
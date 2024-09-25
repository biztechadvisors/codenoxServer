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
const date_fns_1 = require("date-fns");
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
    async getAnalyticsById(analyticsId) {
        const analytics = await this.analyticsRepository.findOne({
            where: { id: analyticsId },
            relations: ['totalYearSaleByMonth'],
        });
        if (!analytics) {
            throw new common_1.NotFoundException(`Analytics with ID ${analyticsId} not found`);
        }
        return analytics;
    }
    async updateAnalytics(order, refund, shop, user) {
        var _a, _b;
        try {
            if (!order && !refund && !shop && !user) {
                throw new common_1.BadRequestException('At least one of Order, Refund, or Shop must be provided');
            }
            let userId;
            if (order) {
                userId = order.dealer ? order.dealer.id : order.shop[0].owner_id;
            }
            else if (refund) {
                userId = refund.customer.createdBy ? refund.customer.createdBy.id : refund.shop.owner_id;
            }
            else if (shop) {
                userId = shop.owner_id ? shop.owner_id : shop.owner.id;
            }
            else if (user) {
                userId = (_a = user === null || user === void 0 ? void 0 : user.createdBy) === null || _a === void 0 ? void 0 : _a.id;
            }
            let usrCrtBy;
            if (user.createdBy) {
                usrCrtBy = await this.userRepository.findOne({ where: { id: user.createdBy.id } });
            }
            const shopId = (shop === null || shop === void 0 ? void 0 : shop.id) || (order === null || order === void 0 ? void 0 : order.shop_id) || (refund === null || refund === void 0 ? void 0 : refund.shop.id) || usrCrtBy.shop_id;
            if (!shopId || !userId) {
                throw new common_1.BadRequestException('Shop ID and User ID must be available');
            }
            let analytics = await this.analyticsRepository.findOne({
                where: { shop_id: shopId, user_id: userId },
                relations: ['totalYearSaleByMonth'],
            });
            if (!analytics) {
                analytics = this.analyticsRepository.create({
                    totalRevenue: 0,
                    totalOrders: 0,
                    totalRefunds: 0,
                    totalShops: shop ? 1 : 0,
                    todaysRevenue: 0,
                    newCustomers: 0,
                    shop_id: shopId,
                    user_id: userId,
                    totalYearSaleByMonth: [],
                });
            }
            const today = (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd');
            const updateValue = (value = 0, delta = 0) => {
                if (typeof value !== 'number' || typeof delta !== 'number') {
                    throw new TypeError('Both value and delta must be numbers');
                }
                return parseFloat((value + delta).toFixed(2));
            };
            analytics.totalRevenue = parseFloat(analytics.totalRevenue.toString());
            analytics.todaysRevenue = parseFloat(analytics.todaysRevenue.toString());
            analytics.totalRefunds = parseFloat(analytics.totalRefunds.toString());
            if (order) {
                analytics.totalOrders += 1;
                analytics.totalRevenue = updateValue(analytics.totalRevenue, order.total);
                if (today === (0, date_fns_1.format)(order.created_at, 'yyyy-MM-dd')) {
                    analytics.todaysRevenue = updateValue(analytics.todaysRevenue, order.total);
                }
            }
            if (user) {
                user = await this.userRepository.findOne({
                    where: { id: user.id },
                    relations: ['permission']
                });
                const permissionName = (_b = user === null || user === void 0 ? void 0 : user.permission) === null || _b === void 0 ? void 0 : _b.type_name;
                if (permissionName === user_entity_1.UserType.Dealer) {
                    analytics.totalDealers += 1;
                }
                else if (permissionName === user_entity_1.UserType.Company) {
                    analytics.totalShops += 1;
                }
                else {
                    analytics.newCustomers += 1;
                }
            }
            if (refund) {
                analytics.totalRefunds = updateValue(analytics.totalRefunds, refund.amount);
                analytics.totalRevenue = updateValue(analytics.totalRevenue, -refund.amount);
                if (today === (0, date_fns_1.format)(refund.created_at, 'yyyy-MM-dd')) {
                    analytics.todaysRevenue = updateValue(analytics.todaysRevenue, -refund.amount);
                }
            }
            const currentMonth = (0, date_fns_1.format)(new Date(), 'MMMM');
            let monthlySale = analytics.totalYearSaleByMonth.find(sale => sale.month === currentMonth);
            const currentTotal = ((order === null || order === void 0 ? void 0 : order.total) || 0) - ((refund === null || refund === void 0 ? void 0 : refund.amount) || 0);
            if (!monthlySale) {
                monthlySale = this.totalYearSaleByMonthRepository.create({
                    month: currentMonth,
                    total: currentTotal,
                });
                analytics.totalYearSaleByMonth.push(monthlySale);
            }
            else {
                monthlySale.total = parseFloat(monthlySale.total.toString());
                monthlySale.total = updateValue(monthlySale.total, currentTotal);
            }
            await this.totalYearSaleByMonthRepository.save(monthlySale);
            await this.analyticsRepository.save(analytics);
        }
        catch (error) {
            this.logger.error('Error updating analytics:', error.stack || error);
            throw new common_1.InternalServerErrorException('Failed to update analytics');
        }
    }
    async createAnalyticsWithTotalYearSale(analyticsData, saleData) {
        try {
            const saleEntities = saleData.map(dto => this.totalYearSaleByMonthRepository.create(dto));
            const totalYearSaleByMonthRecords = await this.totalYearSaleByMonthRepository.save(saleEntities);
            const newAnalytics = this.analyticsRepository.create(Object.assign(Object.assign({}, analyticsData), { totalYearSaleByMonth: totalYearSaleByMonthRecords }));
            return await this.analyticsRepository.save(newAnalytics);
        }
        catch (error) {
            this.logger.error('Error creating analytics with total year sale by month:', error.message);
            throw new common_1.InternalServerErrorException('Failed to create analytics with total year sale by month');
        }
    }
    async findAll(shop_id, customerId, state, startDate, endDate) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        try {
            if (!customerId && !shop_id) {
                return { message: 'Customer ID or Shop ID is required' };
            }
            let user, shop;
            let isOwnerMatch = false;
            if (shop_id) {
                shop = await this.shopRepository.findOne({
                    where: { id: shop_id },
                    relations: ['owner', 'owner.permission']
                });
                if (!shop) {
                    return { message: `Shop with ID ${shop_id} not found` };
                }
                if (!customerId) {
                    customerId = shop.owner_id;
                    isOwnerMatch = true;
                }
                else if (customerId === shop.owner_id) {
                    isOwnerMatch = true;
                }
            }
            if (!isOwnerMatch && customerId) {
                user = await this.userRepository.findOne({
                    where: { id: customerId },
                    relations: ['permission']
                });
                if (!user) {
                    return { message: `User with ID ${customerId} not found` };
                }
            }
            const permissionName = ((_a = user === null || user === void 0 ? void 0 : user.permission) === null || _a === void 0 ? void 0 : _a.permission_name) || ((_c = (_b = shop === null || shop === void 0 ? void 0 : shop.owner) === null || _b === void 0 ? void 0 : _b.permission) === null || _c === void 0 ? void 0 : _c.permission_name);
            const userPermissions = await this.permissionRepository.findOne({ where: { permission_name: permissionName } });
            if (!userPermissions) {
                return { message: `User with ID ${customerId} does not have any permissions` };
            }
            const allowedPermissions = ['Admin', 'Super_Admin', 'Dealer', 'Company'];
            if (!allowedPermissions.includes(userPermissions.type_name)) {
                return { message: `User with ID ${customerId} does not have permission to access analytics` };
            }
            let userIdArray = [];
            if (isOwnerMatch) {
                if (userPermissions.type_name === 'Dealer') {
                    userIdArray.push(customerId);
                }
                else if (userPermissions.type_name === 'Company') {
                    const userIds = await this.userRepository.find({
                        where: { createdBy: { id: shop === null || shop === void 0 ? void 0 : shop.owner_id } },
                        select: ['id']
                    });
                    userIdArray = userIds.map(user => user.id);
                    if ((shop === null || shop === void 0 ? void 0 : shop.owner_id) && !userIdArray.includes(shop.owner_id)) {
                        userIdArray.push(shop.owner_id);
                    }
                }
                else {
                    userIdArray.push(shop === null || shop === void 0 ? void 0 : shop.owner_id);
                }
            }
            else {
                userIdArray.push(customerId);
            }
            if (userIdArray.length === 0) {
                return { message: `No users found matching the criteria for shop ID ${shop_id} and customer ID ${customerId}` };
            }
            let whereClause = {
                user_id: (0, typeorm_2.In)(userIdArray)
            };
            if (shop_id && isOwnerMatch) {
                whereClause.shop_id = shop_id;
            }
            if (state) {
                whereClause.state = state;
            }
            if (startDate && endDate) {
                whereClause.created_at = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                };
            }
            const analyticsResponse = await this.analyticsRepository.find({
                where: whereClause,
                relations: ['totalYearSaleByMonth']
            });
            if (analyticsResponse.length === 0) {
                return { message: `No analytics found for shop ID ${shop_id} and customer ID ${customerId}` };
            }
            const aggregatedResponse = {
                totalRevenue: 0,
                totalOrders: 0,
                totalRefunds: 0,
                totalShops: 0,
                todaysRevenue: 0,
                newCustomers: 0,
                totalYearSaleByMonth: this.initializeMonthlySales()
            };
            for (const analytics of analyticsResponse) {
                aggregatedResponse.totalRevenue += parseFloat(((_d = analytics.totalRevenue) === null || _d === void 0 ? void 0 : _d.toString()) || "0");
                aggregatedResponse.totalOrders += (_e = analytics.totalOrders) !== null && _e !== void 0 ? _e : 0;
                aggregatedResponse.totalRefunds += parseFloat(((_f = analytics.totalRefunds) === null || _f === void 0 ? void 0 : _f.toString()) || "0");
                aggregatedResponse.totalShops += (_g = analytics.totalShops) !== null && _g !== void 0 ? _g : 0;
                aggregatedResponse.todaysRevenue += parseFloat(((_h = analytics.todaysRevenue) === null || _h === void 0 ? void 0 : _h.toString()) || "0");
                aggregatedResponse.newCustomers += (_j = analytics.newCustomers) !== null && _j !== void 0 ? _j : 0;
                (_k = analytics.totalYearSaleByMonth) === null || _k === void 0 ? void 0 : _k.forEach((monthSale) => {
                    var _a;
                    const monthIndex = this.getMonthIndex(monthSale.month);
                    aggregatedResponse.totalYearSaleByMonth[monthIndex].total += parseFloat(((_a = monthSale.total) === null || _a === void 0 ? void 0 : _a.toString()) || "0");
                });
            }
            return aggregatedResponse;
        }
        catch (error) {
            this.logger.error('Error fetching analytics:', error.message);
            return { message: `Error fetching analytics: ${error.message}` };
        }
    }
    initializeMonthlySales() {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months.map(month => ({ total: 0, month }));
    }
    getMonthIndex(month) {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months.indexOf(month);
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
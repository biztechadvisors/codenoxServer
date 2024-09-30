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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StocksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const stocks_entity_1 = require("./entities/stocks.entity");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const dealer_entity_1 = require("../users/entities/dealer.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const stocksOrd_entity_1 = require("./entities/stocksOrd.entity");
const class_transformer_1 = require("class-transformer");
const order_status_entity_1 = require("../orders/entities/order-status.entity");
const product_entity_1 = require("../products/entities/product.entity");
const shiprocket_service_1 = require("../orders/shiprocket.service");
const mail_service_1 = require("../mail/mail.service");
const coupon_entity_1 = require("../coupons/entities/coupon.entity");
const address_entity_1 = require("../address/entities/address.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const permission_entity_1 = require("../permission/entities/permission.entity");
const paginate_1 = require("../common/pagination/paginate");
const notifications_service_1 = require("../notifications/services/notifications.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_2 = require("@nestjs/cache-manager");
let StocksService = class StocksService {
    constructor(shiprocketService, MailService, notificationService, stocksRepository, inventoryStocksRepository, userRepository, dealerRepository, productRepository, StocksSellOrdRepository, orderProductPivotRepository, orderStatusRepository, couponRepository, userAddressRepository, shopRepository, permissionRepository, variationRepository, orderRepository, cacheManager) {
        this.shiprocketService = shiprocketService;
        this.MailService = MailService;
        this.notificationService = notificationService;
        this.stocksRepository = stocksRepository;
        this.inventoryStocksRepository = inventoryStocksRepository;
        this.userRepository = userRepository;
        this.dealerRepository = dealerRepository;
        this.productRepository = productRepository;
        this.StocksSellOrdRepository = StocksSellOrdRepository;
        this.orderProductPivotRepository = orderProductPivotRepository;
        this.orderStatusRepository = orderStatusRepository;
        this.couponRepository = couponRepository;
        this.userAddressRepository = userAddressRepository;
        this.shopRepository = shopRepository;
        this.permissionRepository = permissionRepository;
        this.variationRepository = variationRepository;
        this.orderRepository = orderRepository;
        this.cacheManager = cacheManager;
    }
    async create(createStocksDto) {
        try {
            const { user_id, order_id, products } = createStocksDto;
            const dealer = await this.userRepository.findOne({
                where: { id: user_id },
                relations: ['dealer'],
            });
            if (!(dealer === null || dealer === void 0 ? void 0 : dealer.dealer)) {
                throw new common_1.NotFoundException(`Dealer not found by ID ${user_id}`);
            }
            const orderEntity = await this.orderRepository.findOne({
                where: { id: order_id },
            });
            if (!orderEntity) {
                throw new common_1.NotFoundException(`Order not found by ID ${order_id}`);
            }
            const updatedStocks = [];
            for (const product of products) {
                if (!product.product_id || !order_id) {
                    throw new common_1.NotFoundException(`Product id or Order id is not defined`);
                }
                const productEntity = await this.productRepository.findOne({
                    where: { id: product.product_id },
                });
                if (!productEntity) {
                    throw new common_1.NotFoundException(`Product not found by ID ${product.product_id}`);
                }
                const variationOptions = product.variation_option_id
                    ? await this.variationRepository.findOne({
                        where: { id: product.variation_option_id },
                    })
                    : null;
                const stock = this.stocksRepository.create({
                    orderedQuantity: product.order_quantity,
                    ordPendQuant: product.order_quantity,
                    receivedQuantity: product.receivedQuantity,
                    dispatchedQuantity: createStocksDto.dispatchedQuantity,
                    product: productEntity,
                    variation_options: variationOptions,
                    user: dealer,
                    order: orderEntity,
                });
                const savedStock = await this.stocksRepository.save(stock);
                updatedStocks.push(savedStock);
                await this.updateInventoryStocks({
                    user_id: dealer.id,
                    product_id: productEntity.id,
                    variation_option_id: variationOptions ? variationOptions.id : null,
                    orderedQuantity: product.order_quantity,
                });
            }
            return updatedStocks;
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error creating stocks: ${error.message}`);
        }
    }
    async updateInventoryStocks(createStocksDto) {
        try {
            const { user_id, product_id, variation_option_id, orderedQuantity } = createStocksDto;
            let existingStock = await this.inventoryStocksRepository.findOne({
                where: {
                    user: { id: parseInt(user_id) },
                    product: { id: parseInt(product_id) },
                    variation_options: { id: parseInt(variation_option_id) || -1 },
                },
                relations: ['product', 'variation_options'],
            });
            if (!existingStock) {
                const userEntity = await this.userRepository.findOne({
                    where: { id: parseInt(user_id) },
                });
                const productEntity = await this.productRepository.findOne({
                    where: { id: parseInt(product_id) },
                });
                const variationOptionEntity = variation_option_id
                    ? await this.variationRepository.findOne({
                        where: { id: parseInt(variation_option_id) },
                    })
                    : null;
                existingStock = this.inventoryStocksRepository.create({
                    quantity: orderedQuantity,
                    status: orderedQuantity > 2,
                    inStock: orderedQuantity > 2,
                    product: productEntity,
                    variation_options: variationOptionEntity ? [variationOptionEntity] : [],
                    user: userEntity,
                });
                await this.inventoryStocksRepository.save(existingStock);
            }
            else {
                existingStock.quantity += orderedQuantity;
                existingStock.status = existingStock.quantity > 2;
                existingStock.inStock = existingStock.quantity > 2;
                await this.inventoryStocksRepository.save(existingStock);
            }
            return [existingStock];
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error updating inventory stock: ${error.message}`);
        }
    }
    async updateStocksbyAdmin(user_id, updateStkQuantityDto) {
        try {
            const { updateDispatchQuant, order_id, product_id, variation_option_id } = updateStkQuantityDto;
            if (!user_id || !product_id) {
                throw new common_1.NotFoundException(`User id or Product id is not defined`);
            }
            const dealer = await this.userRepository.findOne({ where: { id: user_id }, relations: ['dealer'] });
            if (!(dealer === null || dealer === void 0 ? void 0 : dealer.dealer)) {
                throw new common_1.NotFoundException(`Dealer not found by ID ${user_id}`);
            }
            const existingStock = await this.stocksRepository.findOne({ where: { user: { id: dealer.id }, product: { id: product_id }, order: { id: order_id }, variation_options: variation_option_id } });
            if (!existingStock) {
                throw new common_1.NotFoundException(`Stock not found for user ID ${user_id} and product ID ${product_id} for order ${order_id}`);
            }
            if (existingStock.orderedQuantity < updateDispatchQuant) {
                throw new Error(`Dispatch quantity is greater than the ordered quantity for order ${order_id}`);
            }
            existingStock.ordPendQuant = existingStock.ordPendQuant - updateDispatchQuant;
            existingStock.dispatchedQuantity = existingStock.dispatchedQuantity + updateDispatchQuant;
            await this.stocksRepository.save(existingStock);
        }
        catch (error) {
            throw new Error(`Error updating stock: ${error.message}`);
        }
    }
    async updateInventoryStocksByDealer(user_id, updateStkQuantityDto) {
        try {
            const { receivedQuantity, order_id, product_id, variation_option_id } = updateStkQuantityDto;
            if (!user_id || !product_id) {
                throw new common_1.NotFoundException(`User id or Product id is not defined`);
            }
            const dealer = await this.userRepository.findOne({ where: { id: user_id }, relations: ['dealer'] });
            if (!(dealer === null || dealer === void 0 ? void 0 : dealer.dealer)) {
                throw new common_1.NotFoundException(`Dealer not found by ID ${user_id}`);
            }
            const existingStock = await this.stocksRepository.findOne({
                where: {
                    user: { id: dealer.id },
                    product: { id: product_id },
                    order: { id: order_id },
                    variation_options: { id: variation_option_id }
                }
            });
            if (!existingStock) {
                throw new common_1.NotFoundException(`Stock not found for user ID ${user_id} and product ID ${product_id} for order ${order_id}`);
            }
            if (existingStock.dispatchedQuantity < receivedQuantity) {
                throw new Error(`Received quantity is greater than the dispatched quantity for user ID ${user_id}`);
            }
            const inventoryStockRep = await this.inventoryStocksRepository.findOne({
                where: {
                    user: { id: dealer.id },
                    product: { id: product_id },
                    variation_options: { id: variation_option_id }
                }
            });
            if (inventoryStockRep) {
                inventoryStockRep.quantity += receivedQuantity;
                if (inventoryStockRep.quantity > 1) {
                    inventoryStockRep.status = true;
                    inventoryStockRep.inStock = true;
                }
                await this.inventoryStocksRepository.save(inventoryStockRep);
            }
            else {
                const newInventoryStock = new stocks_entity_1.InventoryStocks();
                newInventoryStock.quantity = receivedQuantity;
                newInventoryStock.product = await this.productRepository.findOne(product_id);
                newInventoryStock.user = dealer;
                newInventoryStock.variation_options = [await this.variationRepository.findOne(variation_option_id)];
                if (newInventoryStock.quantity > 1) {
                    newInventoryStock.status = true;
                    newInventoryStock.inStock = true;
                }
                await this.inventoryStocksRepository.save(newInventoryStock);
            }
            existingStock.receivedQuantity = existingStock.receivedQuantity + receivedQuantity;
            existingStock.dispatchedQuantity = existingStock.dispatchedQuantity - receivedQuantity;
            await this.stocksRepository.save(existingStock);
        }
        catch (error) {
            throw new Error(`Error updating stock: ${error.message}`);
        }
    }
    async getAll(user_id, order_id) {
        try {
            if (!user_id || !order_id) {
                throw new common_1.NotFoundException(`User ID or Order ID is not defined`);
            }
            const cacheKey = `stocks_${user_id}_${order_id}`;
            const cachedResult = await this.cacheManager.get(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }
            const stocks = await this.stocksRepository.find({
                where: {
                    user: { id: user_id },
                    order: { id: order_id }
                },
                relations: ['product', 'order', 'user', 'variation_options']
            });
            await this.cacheManager.set(cacheKey, stocks, 60);
            return stocks;
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error fetching stocks: ${error.message}`);
        }
    }
    async getAllStocks(user_id) {
        try {
            if (!user_id) {
                throw new common_1.NotFoundException(`User id is not defined`);
            }
            const cacheKey = `stocks_${user_id}`;
            const cachedResult = await this.cacheManager.get(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }
            const dealerList = await this.userRepository.find({
                where: [
                    { createdBy: { id: user_id } },
                    { id: user_id }
                ],
                select: ['id']
            });
            const allStocks = [];
            for (const dealer of dealerList) {
                const dealerStocks = await this.stocksRepository.find({
                    where: { user: { id: dealer.id } },
                    relations: ['product', 'order', 'user', 'variation_options']
                });
                if (dealerStocks.length > 0) {
                    const stocks = dealerStocks.map(stock => ({
                        id: stock.id,
                        orderedQuantity: stock.orderedQuantity,
                        ordPendQuant: stock.ordPendQuant,
                        dispatchedQuantity: stock.dispatchedQuantity,
                        receivedQuantity: stock.receivedQuantity,
                        product: stock.product,
                        variation_options: stock.variation_options,
                        order: stock.order
                    }));
                    const obj = {
                        user: dealerStocks[0].user,
                        stocks: stocks
                    };
                    allStocks.push(obj);
                }
            }
            await this.cacheManager.set(cacheKey, allStocks, 60);
            return allStocks;
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error fetching stocks: ${error.message}`);
        }
    }
    async getDealerInventoryStocks(userId) {
        try {
            if (!userId) {
                throw new common_1.NotFoundException(`User ID is not defined`);
            }
            const cacheKey = `inventory_stocks_${userId}`;
            const cachedResult = await this.cacheManager.get(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }
            const inventoryStocks = await this.inventoryStocksRepository.find({
                where: { user: { id: userId } },
                relations: ['product', 'variation_options', 'user'],
            });
            if (inventoryStocks.length === 0) {
                throw new common_1.NotFoundException(`No inventory stocks found for user ID ${userId}`);
            }
            const result = inventoryStocks.map(stock => ({
                id: stock.id,
                quantity: stock.quantity,
                status: stock.status,
                inStock: stock.inStock,
                product: stock.product,
                variation_options: stock.variation_options,
            }));
            await this.cacheManager.set(cacheKey, result, 60);
            return result;
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error fetching inventory stocks: ${error.message}`);
        }
    }
    async afterORD(createOrderDto) {
        try {
            const existingStocks = await this.inventoryStocksRepository.find({
                where: {
                    user: { id: Number(createOrderDto.dealerId) },
                    product: { id: (0, typeorm_1.In)(createOrderDto.products.map(product => product.product_id)) }
                },
                relations: ['product', 'variation_options'],
            });
            for (const orderProduct of createOrderDto.products) {
                const stock = existingStocks.find(s => s.product.id === orderProduct.product_id);
                if (!stock) {
                    throw new common_1.NotFoundException(`Stock with product ID ${orderProduct.product_id} not found for user ${createOrderDto.dealerId}`);
                }
                if (stock.quantity >= orderProduct.order_quantity) {
                    stock.quantity -= orderProduct.order_quantity;
                }
                else {
                    throw new common_1.NotFoundException(`This Product ${orderProduct.product_id} is out of stock`);
                }
                const updatedStock = Object.assign(Object.assign({}, stock), { variation_options: stock.variation_options.map(variation => (Object.assign({}, variation))) });
                await this.inventoryStocksRepository.save(updatedStock);
            }
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error updating stock after order: ${error.message}`);
        }
    }
    async OrdfromStocks(createOrderInput) {
        var _a;
        try {
            const order = (0, class_transformer_1.plainToClass)(stocksOrd_entity_1.StocksSellOrd, createOrderInput);
            const newOrderStatus = new order_status_entity_1.OrderStatus();
            newOrderStatus.name = 'Order Processing';
            newOrderStatus.color = '#d87b64';
            const paymentGatewayType = createOrderInput.payment_gateway
                ? createOrderInput.payment_gateway
                : order_entity_1.PaymentGatewayType.CASH_ON_DELIVERY;
            order.payment_gateway = paymentGatewayType;
            order.customerId = order.customerId ? order.customerId : order.customer_id;
            order.customer_id = order.customer_id;
            order.customer = createOrderInput.dealerId ? createOrderInput.dealerId : null;
            switch (paymentGatewayType) {
                case order_entity_1.PaymentGatewayType.CASH_ON_DELIVERY:
                    order.order_status = order_entity_1.OrderStatusType.PROCESSING;
                    order.payment_status = order_entity_1.PaymentStatusType.CASH_ON_DELIVERY;
                    newOrderStatus.slug = order_entity_1.OrderStatusType.PROCESSING;
                    break;
                case order_entity_1.PaymentGatewayType.CASH:
                    order.order_status = order_entity_1.OrderStatusType.PROCESSING;
                    order.payment_status = order_entity_1.PaymentStatusType.CASH;
                    newOrderStatus.slug = order_entity_1.OrderStatusType.PROCESSING;
                    break;
                case order_entity_1.PaymentGatewayType.FULL_WALLET_PAYMENT:
                    order.order_status = order_entity_1.OrderStatusType.COMPLETED;
                    order.payment_status = order_entity_1.PaymentStatusType.WALLET;
                    newOrderStatus.slug = order_entity_1.OrderStatusType.COMPLETED;
                    break;
                default:
                    order.order_status = order_entity_1.OrderStatusType.PENDING;
                    order.payment_status = order_entity_1.PaymentStatusType.PENDING;
                    newOrderStatus.slug = order_entity_1.OrderStatusType.PENDING;
                    break;
            }
            if (order.customer_id && order.customer) {
                const customer = await this.userRepository.findOne({
                    where: { id: order.customer_id, email: order.customer.email }, relations: ['permission']
                });
                if (!customer) {
                    throw new common_1.NotFoundException('Customer not found');
                }
                order.customer = customer;
            }
            const Invoice = "OD" + Math.floor(Math.random() * Date.now());
            order.tracking_number = order.tracking_number || Invoice;
            if (!order.products || order.products.some(product => product.product_id === undefined)) {
                throw new Error('Invalid order.products');
            }
            const savedOrder = await this.StocksSellOrdRepository.save(order);
            if (order.products) {
                const productEntities = await this.productRepository.find({
                    where: { id: (0, typeorm_1.In)(order.products.map(product => product.product_id)) },
                });
                if (productEntities.length > 0) {
                    for (const product of order.products) {
                        if (product) {
                            const newPivot = new product_entity_1.OrderProductPivot();
                            newPivot.order_quantity = product.order_quantity;
                            newPivot.unit_price = product.unit_price;
                            newPivot.subtotal = product.subtotal;
                            newPivot.variation_option_id = product.variation_option_id;
                            newPivot.Ord_Id = savedOrder.id;
                            const productEntity = productEntities.find(entity => entity.id === product.product_id);
                            newPivot.product = productEntity;
                            newPivot.StocksSellOrd = savedOrder;
                            await this.orderProductPivotRepository.save(newPivot);
                        }
                    }
                    order.products = productEntities;
                    return await this.StocksSellOrdRepository.save(order);
                }
                else {
                    throw new common_1.NotFoundException('Product not found');
                }
            }
            const createdOrderStatus = await this.orderStatusRepository.save(newOrderStatus);
            order.status = createdOrderStatus;
            if (createOrderInput.soldBy) {
                const getSoldBy = await this.userRepository.findOne({ where: { id: createOrderInput.soldBy.id } });
                if (getSoldBy) {
                    order.soldBy = getSoldBy;
                }
                else {
                    throw new common_1.NotFoundException('Shop not found');
                }
            }
            if ((_a = createOrderInput.soldByUserAddress) === null || _a === void 0 ? void 0 : _a.id) {
                const getSale = await this.userAddressRepository.findOne({ where: { id: createOrderInput.soldByUserAddress.id } });
                if (getSale) {
                    order.soldByUserAddress = getSale;
                }
                else {
                    throw new common_1.NotFoundException('Dealer shop not found');
                }
            }
            const finalSavedOrder = await this.StocksSellOrdRepository.save(order);
            let notificationTitle = 'Order Created';
            let notificationMessage = `New order with ID ${savedOrder.id} has been successfully created.`;
            if (savedOrder.customer) {
                await this.notificationService.createNotification(finalSavedOrder.customer.id, notificationTitle, notificationMessage);
            }
            return finalSavedOrder;
        }
        catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }
    async getOrders({ limit, page, customer_id, tracking_number, search, shop_id, }) {
        try {
            if (!customer_id) {
                throw new common_1.BadRequestException('Customer ID is required');
            }
            const user = await this.userRepository.findOne({ where: { id: customer_id }, relations: ['permission', 'permission.permissions'] });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const cacheKey = `orders_${customer_id}_${tracking_number || ''}_${search || ''}_${shop_id || ''}_${limit || 15}_${page || 1}`;
            const cachedResult = await this.cacheManager.get(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }
            let query = this.StocksSellOrdRepository.createQueryBuilder('StocksSellOrd');
            query = query.leftJoinAndSelect('StocksSellOrd.status', 'status');
            query = query.leftJoinAndSelect('StocksSellOrd.billing_address', 'billing_address');
            query = query.leftJoinAndSelect('StocksSellOrd.shipping_address', 'shipping_address');
            query = query.leftJoinAndSelect('StocksSellOrd.customer', 'customer');
            query = query.leftJoinAndSelect('StocksSellOrd.products', 'products')
                .leftJoinAndSelect('products.pivot', 'pivot')
                .leftJoinAndSelect('products.taxes', 'taxes')
                .leftJoinAndSelect('products.variation_options', 'variation_options');
            query = query.leftJoinAndSelect('StocksSellOrd.soldBy', 'soldBy');
            if (!(user.permission.type_name === user_entity_1.UserType.Dealer || user.permission.type_name === user_entity_1.UserType.Staff)) {
                const users = await this.userRepository.find({
                    where: { createdBy: { id: user.id } }, relations: ['permission', 'permission.permissions']
                });
                const userIds = [user.id, ...users.map(u => u.id)];
                query = query.andWhere('StocksSellOrd.customerId IN (:...userIds)', { userIds });
            }
            if (shop_id && shop_id !== 'undefined') {
                query = query.andWhere('products.shop_id = :shopId', { shopId: Number(shop_id) });
            }
            if (search) {
                query = query.andWhere('(status.name ILIKE :searchValue OR StocksSellOrd.tracking_number ILIKE :searchValue)', {
                    searchValue: `%${search}%`,
                });
            }
            if (tracking_number) {
                query = query.andWhere('StocksSellOrd.tracking_number = :trackingNumber', { trackingNumber: tracking_number });
            }
            const startIndex = (page || 1 - 1) * (limit || 15);
            const [data, totalCount] = await query
                .skip(startIndex)
                .take(limit || 15)
                .getManyAndCount();
            const results = await Promise.all(data.map(async (order) => {
                const products = await Promise.all(order.products.map(async (product) => {
                    const pivot = await this.orderProductPivotRepository.findOne({
                        where: {
                            product: { id: product.id },
                            Ord_Id: order.id,
                        },
                    });
                    return {
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        description: product.description,
                        type_id: product.type_id,
                        price: product.price,
                        shop_id: product.shop_id,
                        sale_price: product.sale_price,
                        language: product.language,
                        min_price: product.min_price,
                        max_price: product.max_price,
                        sku: product.sku,
                        quantity: product.quantity,
                        in_stock: product.in_stock,
                        is_taxable: product.is_taxable,
                        shipping_class_id: null,
                        status: product.status,
                        product_type: product.product_type,
                        unit: product.unit,
                        height: product.height || null,
                        width: product.width || null,
                        length: product.length || null,
                        image: product.image,
                        video: null,
                        gallery: product.gallery,
                        deleted_at: null,
                        created_at: product.created_at,
                        updated_at: product.updated_at,
                        author_id: null,
                        manufacturer_id: null,
                        is_digital: 0,
                        is_external: 0,
                        external_product_url: null,
                        external_product_button_text: null,
                        ratings: product.ratings,
                        total_reviews: product.my_review,
                        rating_count: product.ratings,
                        my_review: product.my_review,
                        in_wishlist: product.in_wishlist,
                        blocked_dates: [],
                        translated_languages: product.translated_languages,
                        taxes: product.taxes,
                        pivot: pivot,
                        variation_options: product.variation_options,
                    };
                }));
                return {
                    id: order.id,
                    tracking_number: order.tracking_number,
                    customer_id: order.customer_id,
                    customer_contact: order.customer_contact,
                    amount: order.amount,
                    sales_tax: order.sales_tax,
                    paid_total: order.paid_total,
                    total: order.total,
                    cancelled_amount: order.cancelled_amount,
                    language: order.language,
                    soldByUserAddress: order.soldByUserAddress,
                    discount: order.discount,
                    payment_gateway: order.payment_gateway,
                    shipping_address: order.shipping_address,
                    billing_address: order.billing_address,
                    status: order.status,
                    products: products,
                };
            }));
            const url = `/orders?search=${search}&limit=${limit}`;
            const paginatedResult = Object.assign({ data: results }, (0, paginate_1.paginate)(totalCount, page, limit, results.length, url));
            await this.cacheManager.set(cacheKey, paginatedResult, 60);
            return paginatedResult;
        }
        catch (error) {
            console.error('Error in getOrders:', error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Error in getOrders: ${error.message}`);
        }
    }
    async getOrderById(id) {
        try {
            const cacheKey = `order_${id}`;
            const cachedOrder = await this.cacheManager.get(cacheKey);
            if (cachedOrder) {
                return cachedOrder;
            }
            const order = await this.StocksSellOrdRepository.createQueryBuilder('order')
                .leftJoinAndSelect('order.status', 'status')
                .leftJoinAndSelect('order.customer', 'customer')
                .leftJoinAndSelect('order.products', 'products')
                .leftJoinAndSelect('order.soldByUserAddress', 'soldByUserAddress')
                .leftJoinAndSelect('products.pivot', 'pivot')
                .leftJoinAndSelect('products.taxes', 'product_taxes')
                .leftJoinAndSelect('products.shop', 'product_shop')
                .leftJoinAndSelect('product_shop.address', 'shop_address')
                .leftJoinAndSelect('order.soldBy', 'soldBy_order')
                .leftJoinAndSelect('order.billing_address', 'billing_address')
                .leftJoinAndSelect('order.shipping_address', 'shipping_address')
                .leftJoinAndSelect('order.coupon', 'coupon')
                .where('order.id = :id', { id })
                .orWhere('order.tracking_number = :tracking_number', { tracking_number: id.toString() })
                .getOne();
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            const transformedOrder = {
                id: order.id,
                tracking_number: order.tracking_number,
                customer_id: order.customer_id,
                customer_contact: order.customer_contact,
                amount: order.amount,
                sales_tax: order.sales_tax,
                paid_total: order.paid_total,
                total: order.total,
                cancelled_amount: order.cancelled_amount,
                language: order.language,
                soldByUserAddress: order.soldByUserAddress,
                soldBy: order.soldBy,
                discount: order.discount,
                payment_gateway: order.payment_gateway,
                shipping_address: order.shipping_address,
                billing_address: order.billing_address,
                logistics_provider: order.logistics_provider,
                delivery_fee: order.delivery_fee,
                delivery_time: order.delivery_time,
                order_status: order.order_status,
                payment_status: order.payment_status,
                created_at: order.created_at,
                customer: {
                    id: order.customer.id,
                    name: order.customer.name,
                    email: order.customer.email,
                    email_verified_at: order.customer.email_verified_at,
                    created_at: order.customer.created_at,
                    updated_at: order.customer.updated_at,
                    is_active: order.customer.is_active,
                },
                dealer: order.customer ? order.customer : null,
                products: await Promise.all(order.products.map(async (product) => {
                    const pivot = product.pivot.find(p => p.Ord_Id === order.id);
                    if (!pivot || !product.id) {
                        return null;
                    }
                    return {
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        description: product.description,
                        type_id: product.type_id,
                        price: product.price,
                        shop_id: product.shop_id,
                        sale_price: product.sale_price,
                        language: product.language,
                        min_price: product.min_price,
                        max_price: product.max_price,
                        sku: product.sku,
                        quantity: product.quantity,
                        in_stock: product.in_stock,
                        is_taxable: product.is_taxable,
                        shipping_class_id: null,
                        status: product.status,
                        product_type: product.product_type,
                        unit: product.unit,
                        height: product.height || null,
                        width: product.width || null,
                        length: product.length || null,
                        image: product.image,
                        video: null,
                        gallery: product.gallery,
                        deleted_at: null,
                        created_at: product.created_at,
                        updated_at: product.updated_at,
                        author_id: null,
                        manufacturer_id: null,
                        is_digital: 0,
                        is_external: 0,
                        external_product_url: null,
                        external_product_button_text: null,
                        ratings: product.ratings,
                        total_reviews: product.my_review,
                        rating_count: product.ratings,
                        my_review: product.my_review,
                        in_wishlist: product.in_wishlist,
                        blocked_dates: [],
                        translated_languages: product.translated_languages,
                        taxes: product.taxes,
                        shop: product.shop,
                        pivot: {
                            order_id: pivot.Ord_Id,
                            product_id: product.id,
                            order_quantity: pivot.order_quantity,
                            unit_price: pivot.unit_price,
                            subtotal: pivot.subtotal,
                            variation_option_id: pivot.variation_option_id,
                            created_at: pivot.created_at,
                            updated_at: pivot.updated_at,
                        },
                        variation_options: product.variation_options,
                    };
                })),
                wallet_point: order.wallet_point
            };
            await this.cacheManager.set(cacheKey, transformedOrder, 60);
            return transformedOrder;
        }
        catch (error) {
            console.error('Error in getOrderByIdOrTrackingNumber:', error);
            throw error;
        }
    }
    async updateOrderStatus(id, updateOrderStatusDto) {
        const order = await this.StocksSellOrdRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.status', 'status')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.products', 'products')
            .leftJoinAndSelect('order.soldByUserAddress', 'soldByUserAddress')
            .leftJoinAndSelect('products.pivot', 'pivot')
            .leftJoinAndSelect('products.taxes', 'product_taxes')
            .leftJoinAndSelect('products.shop', 'product_shop')
            .leftJoinAndSelect('product_shop.address', 'shop_address')
            .leftJoinAndSelect('order.soldBy', 'soldBy_order')
            .leftJoinAndSelect('order.billing_address', 'billing_address')
            .leftJoinAndSelect('order.shipping_address', 'shipping_address')
            .leftJoinAndSelect('order.coupon', 'coupon')
            .where('order.id = :id', { id })
            .orWhere('order.tracking_number = :tracking_number', { tracking_number: id.toString() })
            .getOne();
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        order.order_status = updateOrderStatusDto.order_status;
        return this.StocksSellOrdRepository.save(order);
    }
    async updatePaymentStatus(id, updatePaymentStatusDto) {
        const order = await this.StocksSellOrdRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.status', 'status')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.products', 'products')
            .leftJoinAndSelect('order.soldByUserAddress', 'soldByUserAddress')
            .leftJoinAndSelect('products.pivot', 'pivot')
            .leftJoinAndSelect('products.taxes', 'product_taxes')
            .leftJoinAndSelect('products.shop', 'product_shop')
            .leftJoinAndSelect('product_shop.address', 'shop_address')
            .leftJoinAndSelect('order.shop_id', 'order_shop')
            .leftJoinAndSelect('order.billing_address', 'billing_address')
            .leftJoinAndSelect('order.shipping_address', 'shipping_address')
            .leftJoinAndSelect('order.coupon', 'coupon')
            .where('order.id = :id', { id })
            .orWhere('order.tracking_number = :tracking_number', { tracking_number: id.toString() })
            .getOne();
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        order.payment_status = updatePaymentStatusDto.payment_status;
        return this.StocksSellOrdRepository.save(order);
    }
};
StocksService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_2.InjectRepository)(stocks_entity_1.Stocks)),
    __param(4, (0, typeorm_2.InjectRepository)(stocks_entity_1.InventoryStocks)),
    __param(5, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(6, (0, typeorm_2.InjectRepository)(dealer_entity_1.Dealer)),
    __param(7, (0, typeorm_2.InjectRepository)(product_entity_1.Product)),
    __param(8, (0, typeorm_2.InjectRepository)(stocksOrd_entity_1.StocksSellOrd)),
    __param(9, (0, typeorm_2.InjectRepository)(product_entity_1.OrderProductPivot)),
    __param(10, (0, typeorm_2.InjectRepository)(order_status_entity_1.OrderStatus)),
    __param(11, (0, typeorm_2.InjectRepository)(coupon_entity_1.Coupon)),
    __param(12, (0, typeorm_2.InjectRepository)(address_entity_1.UserAdd)),
    __param(13, (0, typeorm_2.InjectRepository)(shop_entity_1.Shop)),
    __param(14, (0, typeorm_2.InjectRepository)(permission_entity_1.Permission)),
    __param(15, (0, typeorm_2.InjectRepository)(product_entity_1.Variation)),
    __param(16, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __param(17, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [shiprocket_service_1.ShiprocketService,
        mail_service_1.MailService,
        notifications_service_1.NotificationService,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        cache_manager_2.Cache])
], StocksService);
exports.StocksService = StocksService;
//# sourceMappingURL=stocks.service.js.map
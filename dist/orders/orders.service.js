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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const paginate_1 = require("../common/pagination/paginate");
const payment_intent_entity_1 = require("../payment-intent/entries/payment-intent.entity");
const paypal_payment_service_1 = require("../payment/paypal-payment.service");
const stripe_payment_service_1 = require("../payment/stripe-payment.service");
const order_status_entity_1 = require("./entities/order-status.entity");
const order_entity_1 = require("./entities/order.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const coupon_entity_1 = require("../coupons/entities/coupon.entity");
const razorpay_payment_service_1 = require("../payment/razorpay-payment.service");
const shiprocket_service_1 = require("./shiprocket.service");
const state_code_tax_1 = require("../taxes/state_code.tax");
const shop_entity_1 = require("../shops/entities/shop.entity");
const mail_service_1 = require("../mail/mail.service");
const stocks_service_1 = require("../stocks/stocks.service");
const notifications_service_1 = require("../notifications/services/notifications.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const address_entity_1 = require("../address/entities/address.entity");
const analytics_service_1 = require("../analytics/analytics.service");
const generic_conditions_dto_1 = require("../common/dto/generic-conditions.dto");
const helpers_1 = require("../helpers");
const cacheService_1 = require("../helpers/cacheService");
let OrdersService = class OrdersService {
    constructor(authService, analyticsService, stripeService, paypalService, razorpayService, shiprocketService, mailService, stocksService, notificationService, orderRepository, orderStatusRepository, userRepository, userAddressRepository, productRepository, orderFilesRepository, fileRepository, paymentIntentInfoRepository, paymentIntentRepository, orderProductPivotRepository, shopRepository, couponRepository, cacheManager, cacheService, dataSource) {
        this.authService = authService;
        this.analyticsService = analyticsService;
        this.stripeService = stripeService;
        this.paypalService = paypalService;
        this.razorpayService = razorpayService;
        this.shiprocketService = shiprocketService;
        this.mailService = mailService;
        this.stocksService = stocksService;
        this.notificationService = notificationService;
        this.orderRepository = orderRepository;
        this.orderStatusRepository = orderStatusRepository;
        this.userRepository = userRepository;
        this.userAddressRepository = userAddressRepository;
        this.productRepository = productRepository;
        this.orderFilesRepository = orderFilesRepository;
        this.fileRepository = fileRepository;
        this.paymentIntentInfoRepository = paymentIntentInfoRepository;
        this.paymentIntentRepository = paymentIntentRepository;
        this.orderProductPivotRepository = orderProductPivotRepository;
        this.shopRepository = shopRepository;
        this.couponRepository = couponRepository;
        this.cacheManager = cacheManager;
        this.cacheService = cacheService;
        this.dataSource = dataSource;
    }
    async updateShopAndProducts(orderDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            const shop = await this.shopRepository.findOne({ where: { id: orderDto.shop_id } });
            if (!shop) {
                throw new common_1.NotFoundException(`Shop with ID ${orderDto.shop_id} not found`);
            }
            shop.orders_count += 1;
            const productIds = orderDto.products.map(p => p.product_id);
            const products = await this.productRepository.find({
                where: { id: (0, typeorm_2.In)(productIds) },
                relations: ['variation_options'],
            });
            if (products.length === 0) {
                throw new common_1.NotFoundException('Products not found');
            }
            for (const orderedProduct of orderDto.products) {
                const product = products.find(p => p.id === orderedProduct.product_id);
                if (!product) {
                    throw new common_1.NotFoundException(`Product with ID ${orderedProduct.product_id} not found`);
                }
                const variation = orderedProduct.variation_option_id
                    ? product.variation_options.find(v => v.id === orderedProduct.variation_option_id)
                    : null;
                const availableQuantity = variation ? variation.quantity : product.quantity;
                if (orderedProduct.order_quantity > availableQuantity) {
                    throw new common_1.BadRequestException(`Order quantity exceeds available stock for product ID ${product.id}`);
                }
                if (variation) {
                    variation.quantity -= orderedProduct.order_quantity;
                    await queryRunner.manager.save(variation);
                }
                else {
                    product.quantity -= orderedProduct.order_quantity;
                }
                await queryRunner.manager.save(product);
                shop.products_count -= orderedProduct.order_quantity;
            }
            await queryRunner.manager.save(shop);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error updating shop and products:', error.message || error);
            throw new common_1.InternalServerErrorException('Failed to update shop and products');
        }
        finally {
            await queryRunner.release();
        }
    }
    async create(createOrderInput) {
        var _a;
        const order = new order_entity_1.Order();
        const paymentGatewayType = createOrderInput.payment_gateway || order_entity_1.PaymentGatewayType.CASH_ON_DELIVERY;
        try {
            if (createOrderInput.customerId) {
                const customer = await this.userRepository.findOne({ where: { id: createOrderInput.customerId }, relations: ['permission'] });
                if (!customer)
                    throw new common_1.NotFoundException('Customer not found');
                order.customer = customer;
                order.customer_id = customer.id;
                order.customer_contact = createOrderInput.customer_contact;
            }
            else if (createOrderInput.customer_contact) {
                order.customer_contact = createOrderInput.customer_contact;
            }
            else {
                throw new common_1.BadRequestException('Customer ID or contact information is required');
            }
            let billingAddress = await this.userAddressRepository.findOne({ where: { id: createOrderInput.billing_address.id } });
            if (!billingAddress) {
                billingAddress = this.userAddressRepository.create(createOrderInput.billing_address);
                await this.userAddressRepository.save(billingAddress);
            }
            order.billing_address = billingAddress;
            let shippingAddress = await this.userAddressRepository.findOne({ where: { id: createOrderInput.shipping_address.id } });
            if (!shippingAddress) {
                shippingAddress = this.userAddressRepository.create(createOrderInput.shipping_address);
                await this.userAddressRepository.save(shippingAddress);
            }
            order.shipping_address = shippingAddress;
            order.payment_gateway = paymentGatewayType;
            order.total = createOrderInput.total || 0;
            order.amount = createOrderInput.amount;
            order.sales_tax = createOrderInput.sales_tax;
            order.paid_total = createOrderInput.paid_total || 0;
            order.discount = createOrderInput.discount || 0;
            order.delivery_fee = createOrderInput.delivery_fee || 0;
            order.delivery_time = createOrderInput.delivery_time;
            order.language = createOrderInput.language || "en";
            order.translated_languages = createOrderInput.translated_languages || ["en"];
            order.shop_id = createOrderInput.shop_id;
            if (createOrderInput.dealerId) {
                const dealer = await this.userRepository.findOne({ where: { id: createOrderInput.dealerId } });
                if (!dealer)
                    throw new common_1.NotFoundException('Dealer not found');
                order.dealer = dealer;
            }
            if (createOrderInput.shop_id) {
                const shopIds = Array.isArray(createOrderInput.shop_id) ? createOrderInput.shop_id : [createOrderInput.shop_id];
                const shops = await this.shopRepository.findByIds(shopIds);
                if (shops.length === 0) {
                    throw new common_1.NotFoundException('Shop not found');
                }
                order.shop = shops;
            }
            if ((_a = createOrderInput.soldByUserAddress) === null || _a === void 0 ? void 0 : _a.id) {
                const soldByUserAddress = await this.userAddressRepository.findOne({ where: { id: createOrderInput.soldByUserAddress.id } });
                if (!soldByUserAddress)
                    throw new common_1.NotFoundException('SoldByUserAddress not found');
                order.soldByUserAddress = soldByUserAddress;
            }
            await this.setOrderStatus(order, paymentGatewayType);
            if (!createOrderInput.products || createOrderInput.products.some(product => !product.product_id)) {
                throw new common_1.BadRequestException('Invalid order products');
            }
            const productEntities = await this.productRepository.find({
                where: { id: (0, typeorm_2.In)(createOrderInput.products.map(product => product.product_id)) },
            });
            if (productEntities.length !== createOrderInput.products.length) {
                throw new common_1.NotFoundException('Some products not found for this order');
            }
            if (createOrderInput.coupon_id) {
                await this.applyCoupon(createOrderInput.coupon_id, order);
            }
            const invoice = `OD${Math.floor(Math.random() * Date.now())}`;
            const orderData = this.createOrderData(createOrderInput, productEntities, invoice);
            const shiprocketResponse = await this.shiprocketService.createOrder(orderData);
            if (!shiprocketResponse.shipment_id && !shiprocketResponse.order_id) {
                throw new common_1.InternalServerErrorException('Failed to create order in Shiprocket');
            }
            order.tracking_number = shiprocketResponse.shipment_id || shiprocketResponse.order_id;
            order.logistics_provider = shiprocketResponse.courier_name || 'Unknown';
            order.products = productEntities;
            const savedOrder = await this.orderRepository.save(order);
            if ([order_entity_1.PaymentGatewayType.STRIPE, order_entity_1.PaymentGatewayType.PAYPAL, order_entity_1.PaymentGatewayType.RAZORPAY].includes(paymentGatewayType)) {
                const paymentIntent = await this.processPaymentIntent(savedOrder);
                order.payment_intent = paymentIntent;
                await this.orderRepository.save(order);
            }
            if (createOrderInput.products) {
                const productEntities = await this.productRepository.find({
                    where: { id: (0, typeorm_2.In)(createOrderInput.products.map(product => product.product_id)) },
                });
                for (const product of createOrderInput.products) {
                    if (product) {
                        const newPivot = new product_entity_1.OrderProductPivot();
                        newPivot.order_quantity = product.order_quantity;
                        newPivot.unit_price = product.unit_price;
                        newPivot.subtotal = product.subtotal;
                        newPivot.variation_option_id = product.variation_option_id;
                        newPivot.order = savedOrder;
                        newPivot.Ord_Id = savedOrder.id;
                        const productEntity = productEntities.find(entity => entity.id === product.product_id);
                        if (productEntity) {
                            newPivot.product = productEntity;
                            await this.orderProductPivotRepository.save(newPivot);
                        }
                        else {
                            throw new common_1.NotFoundException('Product not found');
                        }
                    }
                }
            }
            savedOrder.children = this.processChildrenOrder(savedOrder);
            if (createOrderInput.products && createOrderInput.products.some(product => product.product_id && product.variation_option_id)) {
                await this.createOrderFiles(savedOrder, productEntities);
            }
            if (savedOrder && savedOrder.customer.id == savedOrder.dealer.id) {
                const createStocksDto = {
                    user_id: savedOrder.customer.id,
                    order_id: savedOrder.id,
                    products: createOrderInput.products,
                };
                if (!createStocksDto.order_id) {
                    throw new Error('Order ID is required');
                }
                await this.stocksService.create(createStocksDto);
            }
            if (savedOrder.customer) {
                await this.notificationService.createNotification(Number(savedOrder.customer.id), 'Order Created', `New order with ID ${savedOrder.id} has been successfully created.`);
            }
            await this.analyticsService.updateAnalytics(savedOrder);
            return savedOrder;
        }
        catch (error) {
            console.error('Error creating order:', error.message || error);
            throw new common_1.InternalServerErrorException('Failed to create order');
        }
    }
    async createOrderFiles(order, products) {
        try {
            if (!Array.isArray(products)) {
                throw new Error('Products should be an array');
            }
            const orderFiles = await Promise.all(products.map(async (product) => {
                if ((product === null || product === void 0 ? void 0 : product.image) || (product === null || product === void 0 ? void 0 : product.url) || (product === null || product === void 0 ? void 0 : product.id)) {
                    const file = new product_entity_1.File();
                    file.attachment_id = product.attachment_id || null;
                    file.url = product.url || '';
                    file.fileable_id = product.id;
                    try {
                        const savedFile = await this.fileRepository.save(file);
                        const orderFile = new order_entity_1.OrderFiles();
                        orderFile.purchase_key = `PK_${Math.random().toString(36).substr(2, 9)}`;
                        orderFile.digital_file_id = savedFile.id;
                        orderFile.order_id = order.id;
                        orderFile.customer_id = order.customer_id;
                        orderFile.file = savedFile;
                        orderFile.fileable = product;
                        return orderFile;
                    }
                    catch (fileError) {
                        console.error(`Error saving file for product ID ${product.id}:`, fileError.message || fileError);
                        return undefined;
                    }
                }
                return undefined;
            }));
            const validOrderFiles = orderFiles.filter(Boolean);
            if (validOrderFiles.length > 0) {
                await this.orderFilesRepository.save(validOrderFiles);
            }
        }
        catch (error) {
            console.error('Error creating order files:', error.message || error);
            throw new common_1.InternalServerErrorException('Failed to create order files');
        }
    }
    async setOrderStatus(order, paymentGatewayType) {
        let statusSlug;
        let statusName;
        let statusColor;
        switch (paymentGatewayType) {
            case order_entity_1.PaymentGatewayType.CASH_ON_DELIVERY:
            case order_entity_1.PaymentGatewayType.CASH:
                order.order_status = order_entity_1.OrderStatusType.PROCESSING;
                order.payment_status = paymentGatewayType === order_entity_1.PaymentGatewayType.CASH_ON_DELIVERY
                    ? order_entity_1.PaymentStatusType.CASH_ON_DELIVERY
                    : order_entity_1.PaymentStatusType.CASH;
                statusSlug = order_entity_1.OrderStatusType.PROCESSING;
                statusName = 'Order Processing';
                statusColor = '#d87b64';
                break;
            case order_entity_1.PaymentGatewayType.FULL_WALLET_PAYMENT:
                order.order_status = order_entity_1.OrderStatusType.COMPLETED;
                order.payment_status = order_entity_1.PaymentStatusType.WALLET;
                statusSlug = order_entity_1.OrderStatusType.COMPLETED;
                statusName = 'Order Completed';
                statusColor = '#4caf50';
                break;
            default:
                order.order_status = order_entity_1.OrderStatusType.PENDING;
                order.payment_status = order_entity_1.PaymentStatusType.PENDING;
                statusSlug = order_entity_1.OrderStatusType.PENDING;
                statusName = 'Order Pending';
                statusColor = '#f44336';
                break;
        }
        let status = await this.orderStatusRepository.findOne({ where: { slug: statusSlug } });
        if (!status) {
            status = this.orderStatusRepository.create({
                name: statusName,
                slug: statusSlug,
                color: statusColor,
                serial: 1,
                language: 'en',
                translated_languages: [],
            });
            await this.orderStatusRepository.save(status);
        }
        order.status = status;
    }
    async applyCoupon(couponId, order) {
        const coupon = await this.couponRepository.findOne({ where: { id: couponId } });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        if (!coupon.is_valid || new Date(coupon.expire_at) < new Date()) {
            throw new common_1.BadRequestException('Coupon is invalid or expired');
        }
        if (order.total < coupon.minimum_cart_amount) {
            throw new common_1.BadRequestException('Order total does not meet the minimum amount required for the coupon');
        }
        order.total -= coupon.amount;
        order.coupon = coupon;
    }
    createOrderData(createOrderInput, productEntities, invoice) {
        var _a, _b;
        const billingAddress = createOrderInput.billing_address || {};
        const shippingAddress = createOrderInput.shipping_address || {};
        return {
            order_id: invoice,
            order_date: new Date().toISOString(),
            pickup_location: 'Primary',
            channel_id: '',
            comment: '',
            billing_customer_name: billingAddress.name || '',
            billing_last_name: billingAddress.lastName || '',
            billing_address: billingAddress.street_address || '',
            billing_address_2: billingAddress.ShippingAddress || '',
            billing_city: billingAddress.city || 'Unknown',
            billing_pincode: billingAddress.zip || '',
            billing_state: billingAddress.state || '',
            billing_country: billingAddress.country || '',
            billing_email: ((_a = createOrderInput.customer) === null || _a === void 0 ? void 0 : _a.email) || '',
            billing_phone: createOrderInput.customer_contact || '',
            shipping_is_billing: true,
            shipping_customer_name: shippingAddress.name || '',
            shipping_last_name: shippingAddress.lastName || '',
            shipping_address: shippingAddress.street_address || '',
            shipping_address_2: shippingAddress.ShippingAddress || '',
            shipping_city: shippingAddress.city || 'Unknown',
            shipping_pincode: shippingAddress.zip || '',
            shipping_country: shippingAddress.country || '',
            shipping_state: shippingAddress.state || '',
            shipping_email: ((_b = createOrderInput.customer) === null || _b === void 0 ? void 0 : _b.email) || '',
            shipping_phone: createOrderInput.customer_contact || '',
            order_items: productEntities.map((product, index) => {
                var _a, _b, _c;
                return ({
                    name: product.name || '',
                    sku: product.sku || Math.random().toString(),
                    units: ((_a = createOrderInput.products[index]) === null || _a === void 0 ? void 0 : _a.order_quantity) || 1,
                    selling_price: product.sale_price || 0,
                    unit_price: ((_b = createOrderInput.products[index]) === null || _b === void 0 ? void 0 : _b.unit_price) || 0,
                    subtotal: ((_c = createOrderInput.products[index]) === null || _c === void 0 ? void 0 : _c.subtotal) || 0,
                    discount: product.discount || 0,
                    tax: product.tax || 0,
                    hsn: product.hsn || '',
                    is_gst: product.is_gst || false,
                    gst: product.gst || 0,
                    original_price: product.original_price || 0,
                });
            }),
            payment_method: createOrderInput.payment_gateway,
            shipping_charges: createOrderInput.delivery_fee || 0,
            giftwrap_charges: 0,
            logistics_provider: (createOrderInput === null || createOrderInput === void 0 ? void 0 : createOrderInput.logistics_provider) || "Other",
            transaction_charges: 0,
            total_discount: createOrderInput.discount || 0,
            sub_total: createOrderInput.total,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 1,
        };
    }
    async getOrders(getOrdersDto) {
        try {
            const { limit = 15, page = 1, customer_id, tracking_number, search, shop_id, shopSlug, soldByUserAddress, type, startDate, endDate, } = getOrdersDto;
            if (!shop_id && (!shopSlug && !customer_id && !tracking_number && !soldByUserAddress)) {
                const order = {
                    data: [],
                    count: 0,
                    current_page: 1,
                    firstItem: null,
                    lastItem: null,
                    last_page: 1,
                    per_page: 10,
                    total: 0,
                    first_page_url: null,
                    last_page_url: null,
                    next_page_url: null,
                    prev_page_url: null,
                };
                return order;
            }
            const startIndex = (page - 1) * limit;
            const cacheKey = `orders-${page}-${limit}-${customer_id}-${tracking_number}-${search}-${shop_id}-${shopSlug}-${soldByUserAddress}-${type}-${startDate}-${endDate}`;
            let ordersCache = await this.cacheManager.get(cacheKey);
            if (!ordersCache) {
                let query = this.orderRepository.createQueryBuilder('order')
                    .leftJoinAndSelect('order.status', 'status')
                    .leftJoinAndSelect('order.dealer', 'dealer')
                    .leftJoinAndSelect('order.billing_address', 'billing_address')
                    .leftJoinAndSelect('order.shipping_address', 'shipping_address')
                    .leftJoinAndSelect('order.customer', 'customer')
                    .leftJoinAndSelect('order.products', 'products')
                    .leftJoinAndSelect('order.orderProductPivots', 'orderProductPivots')
                    .leftJoinAndSelect('products.pivot', 'pivot')
                    .leftJoinAndSelect('products.taxes', 'taxes')
                    .leftJoinAndSelect('products.variation_options', 'variation_options')
                    .leftJoinAndSelect('order.payment_intent', 'payment_intent')
                    .leftJoinAndSelect('payment_intent.payment_intent_info', 'payment_intent_info')
                    .leftJoinAndSelect('order.shop', 'shop')
                    .leftJoinAndSelect('order.coupon', 'coupon');
                if (customer_id) {
                    query = query.andWhere('order.customer.id = :customerId', { customerId: Number(customer_id) });
                }
                if (type) {
                    query = query.andWhere('order.type = :type', { type });
                }
                if (tracking_number) {
                    query = query.andWhere('order.tracking_number = :trackingNumber', { trackingNumber: tracking_number });
                }
                if (soldByUserAddress) {
                    query = query.andWhere('order.soldByUserAddress = :soldByUserAddress', { soldByUserAddress });
                }
                if (shop_id) {
                    query = query.andWhere('shop.id = :shopId', { shopId: Number(shop_id) });
                }
                else if (shopSlug) {
                    const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
                    if (!shop)
                        throw new common_1.NotFoundException('Shop not found');
                    query = query.andWhere('shop.id = :shopId', { shopId: shop.id });
                }
                if (search) {
                    query = query.andWhere('(status.name LIKE :searchValue OR order.tracking_number LIKE :searchValue)', {
                        searchValue: `%${search}%`,
                    });
                }
                if (startDate && endDate) {
                    query = query.andWhere('order.created_at BETWEEN :startDate AND :endDate', { startDate, endDate });
                }
                const [data, totalCount] = await query
                    .skip(startIndex)
                    .take(limit)
                    .getManyAndCount();
                const results = await Promise.all(data.map(async (order) => {
                    const products = await Promise.all(order.products.map(async (product) => {
                        let pivot = await this.orderProductPivotRepository.findOne({
                            where: {
                                product: { id: product.id },
                                Ord_Id: order.id,
                            },
                        });
                        const transformedPivot = pivot
                            ? {
                                id: pivot.id,
                                variation_option_id: pivot.variation_option_id,
                                order_quantity: pivot.order_quantity,
                                unit_price: pivot.unit_price,
                                subtotal: pivot.subtotal,
                                Ord_Id: pivot.Ord_Id,
                                created_at: pivot.created_at,
                                updated_at: pivot.updated_at,
                            }
                            : null;
                        return transformedPivot ? Object.assign(Object.assign({}, product), { pivot: transformedPivot }) : null;
                    }));
                    return Object.assign(Object.assign({}, order), { products: products.filter((p) => p !== null) });
                }));
                const url = `/orders?search=${search || ''}&limit=${limit}`;
                ordersCache = Object.assign({ data: results }, (0, paginate_1.paginate)(totalCount, page, limit, results.length, url));
                await this.cacheManager.set(cacheKey, ordersCache, 60);
            }
            return ordersCache;
        }
        catch (error) {
            console.error('Error in getOrders:', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve orders');
        }
    }
    async updateOrderInDatabase(id, updateOrderDto) {
        try {
            const existingOrder = await this.orderRepository.findOne({
                where: { id: id },
                relations: [
                    'status',
                    'customer',
                    'products',
                    'payment_intent',
                    'shop',
                    'billing_address',
                    'shipping_address',
                    'parentOrder',
                    'children',
                    'coupon',
                ],
            });
            if (!existingOrder) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (updateOrderDto.status) {
                const orderStatus = await this.orderStatusRepository.findOne({
                    where: { name: updateOrderDto.status },
                });
                if (!orderStatus) {
                    throw new common_1.BadRequestException('Invalid order status');
                }
                existingOrder.status = orderStatus;
            }
            Object.assign(existingOrder, updateOrderDto);
            return await this.orderRepository.save(existingOrder);
        }
        catch (error) {
            console.error('Error updating order:', error);
            throw new common_1.InternalServerErrorException('Failed to update order');
        }
    }
    async getOrderByIdOrTrackingNumber(id) {
        try {
            const cacheKey = `order-${id}`;
            let order = await this.cacheManager.get(cacheKey);
            if (!order) {
                const fetchedOrder = await this.orderRepository.createQueryBuilder('order')
                    .leftJoinAndSelect('order.status', 'status')
                    .leftJoinAndSelect('order.dealer', 'dealer')
                    .leftJoinAndSelect('order.customer', 'customer')
                    .leftJoinAndSelect('order.orderProductPivots', 'pivot')
                    .leftJoinAndSelect('pivot.product', 'product')
                    .leftJoinAndSelect('product.taxes', 'product_taxes')
                    .leftJoinAndSelect('product.shop', 'product_shop')
                    .leftJoinAndSelect('product_shop.address', 'shop_address')
                    .leftJoinAndSelect('order.payment_intent', 'payment_intent')
                    .leftJoinAndSelect('payment_intent.payment_intent_info', 'payment_intent_info')
                    .leftJoinAndSelect('order.shop', 'order_shop')
                    .leftJoinAndSelect('order.billing_address', 'billing_address')
                    .leftJoinAndSelect('order.shipping_address', 'shipping_address')
                    .leftJoinAndSelect('order.parentOrder', 'parentOrder')
                    .leftJoinAndSelect('order.children', 'children')
                    .leftJoinAndSelect('order.coupon', 'coupon')
                    .leftJoinAndSelect('order.products', 'products')
                    .where('order.id = :id', { id })
                    .orWhere('order.tracking_number = :tracking_number', { tracking_number: id.toString() })
                    .getOne();
                if (!fetchedOrder) {
                    throw new common_1.NotFoundException('Order not found');
                }
                order = this.transformOrder(fetchedOrder);
                await this.cacheManager.set(cacheKey, order, 60);
            }
            return order;
        }
        catch (error) {
            console.error('Error in getOrderByIdOrTrackingNumber:', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve order');
        }
    }
    transformOrder(order) {
        const pivotsByProductId = new Map();
        if (order.orderProductPivots) {
            order.orderProductPivots.forEach((pivot) => {
                if (pivot && pivot.product) {
                    pivotsByProductId.set(pivot.product.id, {
                        id: pivot.id,
                        variation_option_id: pivot.variation_option_id,
                        order_quantity: pivot.order_quantity,
                        unit_price: pivot.unit_price,
                        subtotal: pivot.subtotal,
                        Ord_Id: pivot.Ord_Id,
                        created_at: pivot.created_at,
                        updated_at: pivot.updated_at,
                    });
                }
            });
        }
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
            coupon_id: order.coupon ? order.coupon.id : null,
            parent_id: order.parentOrder ? order.parentOrder.id : null,
            soldByUserAddress: order.soldByUserAddress,
            shop: order.shop,
            discount: order.discount,
            payment_gateway: order.payment_gateway,
            shipping_address: order.shipping_address,
            billing_address: order.billing_address,
            logistics_provider: order.logistics_provider,
            delivery_fee: order.delivery_fee,
            delivery_time: order.delivery_time,
            order_status: order.order_status,
            payment_status: order.payment_status,
            payment_intent: order.payment_intent,
            created_at: order.created_at,
            updated_at: order.updated_at,
            status: order.status,
            products: order.products.map((product) => {
                const pivot = pivotsByProductId.get(product.id) || null;
                return Object.assign(Object.assign({}, product), { pivot });
            }),
        };
    }
    async getOrderStatuses(query) {
        const { orderBy, sortedBy, search, language, limit, page } = query;
        const queryBuilder = this.orderStatusRepository.createQueryBuilder('orderStatus');
        if (search) {
            queryBuilder.where('orderStatus.name LIKE :search', { search: `%${search}%` });
        }
        if (language) {
            queryBuilder.andWhere('orderStatus.language = :language', { language });
        }
        if (orderBy && sortedBy) {
            const mappedSortOrder = sortedBy === generic_conditions_dto_1.SortOrder.ASC ? 'ASC' : 'DESC';
            queryBuilder.orderBy(`orderStatus.${orderBy}`, mappedSortOrder);
        }
        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        const current_page = page;
        const per_page = limit;
        const last_page = Math.ceil(total / limit);
        const count = data.length;
        const firstItem = (page - 1) * limit + 1;
        const lastItem = firstItem + data.length - 1;
        const baseUrl = ``;
        const first_page_url = `${baseUrl}?page=1&limit=${limit}`;
        const last_page_url = `${baseUrl}?page=${last_page}&limit=${limit}`;
        const next_page_url = current_page < last_page ? `${baseUrl}?page=${current_page + 1}&limit=${limit}` : null;
        const prev_page_url = current_page > 1 ? `${baseUrl}?page=${current_page - 1}&limit=${limit}` : null;
        return {
            data,
            total,
            current_page,
            per_page,
            last_page,
            count,
            firstItem,
            lastItem,
            first_page_url,
            last_page_url,
            next_page_url,
            prev_page_url,
        };
    }
    async getOrderStatus(param, language) {
        const queryBuilder = this.orderStatusRepository.createQueryBuilder('orderStatus')
            .where('orderStatus.name = :param OR orderStatus.id = :param', { param });
        if (language) {
            queryBuilder.andWhere('orderStatus.language = :language', { language });
        }
        return await queryBuilder.getOne();
    }
    async update(id, updateOrderInput) {
        try {
            const updatedOrder = await this.updateOrderInDatabase(id, updateOrderInput);
            if (!updatedOrder) {
                throw new common_1.NotFoundException('Order not found or not updated');
            }
            return updatedOrder;
        }
        catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }
    async remove(id) {
        try {
            const orderToDelete = await this.orderRepository.createQueryBuilder('order')
                .leftJoinAndSelect('order.status', 'status')
                .leftJoinAndSelect('order.customer', 'customer')
                .leftJoinAndSelect('order.products', 'products')
                .leftJoinAndSelect('products.pivot', 'pivot')
                .leftJoinAndSelect('order.payment_intent', 'payment_intent')
                .leftJoinAndSelect('order.shop', 'shop')
                .leftJoinAndSelect('order.billing_address', 'billing_address')
                .leftJoinAndSelect('order.shipping_address', 'shipping_address')
                .leftJoinAndSelect('order.parentOrder', 'parentOrder')
                .leftJoinAndSelect('order.children', 'children')
                .leftJoinAndSelect('order.coupon', 'coupon')
                .where('order.id = :id', { id })
                .getOne();
            if (!orderToDelete) {
                throw new common_1.NotFoundException('Order not found');
            }
            orderToDelete.status = null;
            orderToDelete.customer = null;
            orderToDelete.products = null;
            orderToDelete.payment_intent = null;
            orderToDelete.shop = null;
            orderToDelete.soldByUserAddress = null;
            orderToDelete.billing_address = null;
            orderToDelete.shipping_address = null;
            orderToDelete.parentOrder = null;
            orderToDelete.children = null;
            orderToDelete.coupon = null;
            await this.orderRepository.save(orderToDelete);
            await this.orderRepository.remove(orderToDelete);
        }
        catch (error) {
            console.error('Error removing order:', error);
            throw error;
        }
    }
    async findOrderStatusInDatabase(id) {
        const order_Status = await this.orderRepository.findOne({ where: { id: id }, relations: ['status'] });
        if (order_Status) {
            return this.orderStatusRepository.findOne({ where: { id: order_Status.status.id } });
        }
    }
    async verifyCheckout(input) {
        let total_tax = 0;
        let shipping_charge = 0;
        let unavailable_products = [];
        for (const product of input.products) {
            const productEntity = await this.productRepository.findOne({
                where: { id: product.product_id },
                relations: ['taxes', 'shop.address'],
            });
            if (!productEntity || productEntity.quantity < product.quantity) {
                unavailable_products.push(product.product_id);
            }
            else {
                const taxRate = productEntity.taxes ? productEntity.taxes.rate : 0;
                total_tax += product.subtotal * taxRate / 100;
                shipping_charge += productEntity.shop ? productEntity.shipping_fee : 0;
            }
        }
        return {
            total_tax,
            shipping_charge,
            unavailable_products,
            wallet_currency: 0,
            wallet_amount: 0,
        };
    }
    async updateOrderStatusInDatabase(id, updateOrderStatusInput) {
        const orderStatus = await this.findOrderStatusInDatabase(id);
        if (!orderStatus) {
            throw new common_1.NotFoundException('Order status not found');
        }
        orderStatus.slug = (0, helpers_1.convertToSlug)(updateOrderStatusInput.name);
        orderStatus.color = updateOrderStatusInput.color;
        orderStatus.serial = updateOrderStatusInput.serial;
        orderStatus.language = updateOrderStatusInput.language;
        const order = await this.orderRepository.findOne({ where: { id: id } });
        if (!order) {
            throw new common_1.NotFoundException('Order associated with this status not found');
        }
        order.order_status = (0, helpers_1.convertToSlug)(updateOrderStatusInput.name);
        await this.orderRepository.save(order);
        await this.orderStatusRepository.save(orderStatus);
        return orderStatus;
    }
    async createOrderStatus(createOrderStatusInput) {
        const orderStatus = this.orderStatusRepository.create(createOrderStatusInput);
        return await this.orderStatusRepository.save(orderStatus);
    }
    async updateOrderStatus(id, updateOrderStatusInput) {
        try {
            const updatedOrderStatus = await this.updateOrderStatusInDatabase(id, updateOrderStatusInput);
            return updatedOrderStatus;
        }
        catch (error) {
            console.error('Error updating order status:', error);
            throw new common_1.InternalServerErrorException('Failed to update order status');
        }
    }
    async getOrderFileItems({ page, limit }) {
        if (!page)
            page = 1;
        if (!limit)
            limit = 30;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        return [];
    }
    async getOrderFiles(getOrderFilesDto) {
        const { order_id } = getOrderFilesDto;
        if (!order_id) {
            throw new common_1.BadRequestException('Order ID is required');
        }
        try {
            const orderFiles = await this.orderFilesRepository.find({
                where: { order_id },
                relations: ['file', 'fileable'],
            });
            if (!orderFiles.length) {
                throw new common_1.NotFoundException('No files found for the given order ID');
            }
            return orderFiles;
        }
        catch (error) {
            console.error('Error retrieving order files:', error);
            throw new common_1.InternalServerErrorException('Failed to retrieve order files');
        }
    }
    async getDigitalFileDownloadUrl(digitalFileId) {
        const item = await this.orderFilesRepository.findOne({
            where: { digital_file_id: digitalFileId },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Digital file with ID ${digitalFileId} not found`);
        }
        return item.file.url;
    }
    async exportOrder(shop_id) {
        try {
            const orders = await this.orderRepository.find({
                where: { shop: { id: Number(shop_id) } },
                relations: ['products', 'products.pivot', 'customer', 'billing_address', 'shipping_address']
            });
            return orders.map(order => ({
                id: order.id,
                customer: order.customer.name,
                totalAmount: order.total,
                products: order.products.map(product => {
                    const pivot = product.pivot.find(p => p.product.id === product.id);
                    return {
                        name: product.name,
                        quantity: pivot ? pivot.order_quantity : 0,
                        unitPrice: pivot ? pivot.unit_price : 0
                    };
                }),
                billingAddress: order.billing_address,
                shippingAddress: order.shipping_address,
                createdAt: order.created_at,
                updatedAt: order.updated_at,
            }));
        }
        catch (error) {
            console.error('Error exporting orders:', error);
            throw new common_1.InternalServerErrorException('Failed to export orders');
        }
    }
    async downloadInvoiceUrl(orderId) {
        const invoice = await this.orderRepository.findOne({
            where: { id: +orderId },
            relations: ['products', 'billing_address', 'shipping_address', 'customer', 'dealer', 'soldByUserAddress', 'products.shop', 'products.taxes', 'products.pivot'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        const hashtabel = {};
        for (const product of invoice.products) {
            if (!hashtabel[product.shop_id]) {
                hashtabel[product.shop_id] = [product];
            }
            else {
                hashtabel[product.shop_id].push(product);
            }
        }
        for (const shopId in hashtabel) {
            if (hashtabel.hasOwnProperty(shopId)) {
                const shopProducts = hashtabel[shopId];
                const taxType = {
                    billing_address: invoice.billing_address,
                    shipping_address: invoice.shipping_address,
                    total_tax_amount: invoice.sales_tax,
                    customer: invoice.customer,
                    dealer: invoice.dealer,
                    soldByUserAddress: invoice.soldByUserAddress,
                    payment_Mode: invoice.payment_gateway,
                    created_at: invoice.created_at,
                    order_no: invoice.id,
                    invoice_date: invoice.created_at,
                    shop_address: shopProducts[0].shop,
                    products: shopProducts,
                };
                if (shopProducts[0].shop.address.state === invoice.shipping_address.state) {
                    const stateCodeValue = state_code_tax_1.stateCode[invoice.shipping_address.state];
                    taxType.CGST = shopProducts[0].taxes.rate * shopProducts[0].pivot.order_quantity / 2;
                    taxType.SGST = shopProducts[0].taxes.rate * shopProducts[0].pivot.order_quantity / 2;
                    taxType.state_code = stateCodeValue;
                }
                else {
                    const stateCodeValue = state_code_tax_1.stateCode[invoice.shipping_address.state];
                    taxType.IGST = shopProducts[0].taxes.rate * shopProducts[0].pivot.order_quantity;
                    taxType.state_code = stateCodeValue;
                }
                await this.mailService.sendInvoiceToCustomerORDealer(taxType);
            }
        }
        if (invoice.customer_id !== invoice.dealer.id && invoice.soldByUserAddress && invoice.dealer) {
            await this.mailService.sendInvoiceDealerToCustomer(invoice);
        }
    }
    processChildrenOrder(order) {
        if (order.children && Array.isArray(order.children)) {
            return order.children.map(child => (Object.assign(Object.assign({}, child), { order_status: order.order_status, payment_status: order.payment_status })));
        }
        return [];
    }
    async processPaymentIntent(order) {
        try {
            const paymentIntent = await this.savePaymentIntent(order);
            const isRedirect = !!paymentIntent.redirect_url;
            const paymentIntentInfo = this.paymentIntentInfoRepository.create({
                order_id: paymentIntent.id,
                client_secret: paymentIntent.client_secret,
                redirect_url: paymentIntent.redirect_url || null,
                is_redirect: isRedirect,
            });
            await this.paymentIntentInfoRepository.save(paymentIntentInfo);
            const paymentIntentRecord = this.paymentIntentRepository.create({
                order_id: order.id,
                tracking_number: order.tracking_number || order.id.toString(),
                payment_gateway: order.payment_gateway.toLowerCase(),
                payment_intent_info: paymentIntentInfo,
            });
            await this.paymentIntentRepository.save(paymentIntentRecord);
            return paymentIntentRecord;
        }
        catch (error) {
            console.error('Error processing payment intent:', error.message || error);
            throw new common_1.InternalServerErrorException('Failed to process payment intent');
        }
    }
    async savePaymentIntent(order) {
        try {
            let user;
            let authUser;
            if (order.customer && order.customer.id) {
                user = await this.userRepository.findOne({
                    where: { id: order.customer.id },
                    relations: ['permission'],
                });
                if (!user) {
                    throw new common_1.NotFoundException(`User with ID ${order.customer.id} not found`);
                }
                authUser = await this.authService.me(user.email, user.id);
            }
            else {
                authUser = { email: order.customer_contact, id: null, isGuest: true };
            }
            switch (order.payment_gateway) {
                case order_entity_1.PaymentGatewayType.STRIPE:
                    const stripeParams = await this.stripeService.createPaymentIntentParams(order, authUser);
                    return this.stripeService.createPaymentIntent(stripeParams);
                case order_entity_1.PaymentGatewayType.PAYPAL:
                    return this.paypalService.createPaymentIntent(order);
                case order_entity_1.PaymentGatewayType.RAZORPAY:
                    return this.razorpayService.createPaymentIntent(order);
                default:
                    throw new common_1.BadRequestException('Unsupported payment gateway');
            }
        }
        catch (error) {
            console.error('Error saving payment intent:', error.message || error);
            throw new common_1.InternalServerErrorException('Failed to save payment intent');
        }
    }
    async stripePay(order) {
        try {
            order.order_status = order_entity_1.OrderStatusType.PROCESSING;
            order.payment_status = order_entity_1.PaymentStatusType.SUCCESS;
            order.payment_intent = null;
            await this.orderRepository.save(order);
        }
        catch (error) {
            console.error('Error processing Stripe payment:', error.message || error);
            throw new common_1.InternalServerErrorException('Failed to process Stripe payment');
        }
    }
    async paypalPay(order) {
        try {
            const response = await this.paypalService.verifyOrder(order.payment_intent.payment_intent_info.order_id);
            if (response.status === 'COMPLETED') {
                order.payment_status = order_entity_1.PaymentStatusType.SUCCESS;
            }
            else {
                order.payment_status = order_entity_1.PaymentStatusType.FAILED;
            }
            order.order_status = order_entity_1.OrderStatusType.PROCESSING;
            await this.orderRepository.save(order);
        }
        catch (error) {
            console.error('Failed to process PayPal payment:', error.message || error);
            order.order_status = order_entity_1.OrderStatusType.FAILED;
            await this.orderRepository.save(order);
        }
    }
    async razorpayPay(order, paymentIntentInfo) {
        if (!order || !paymentIntentInfo || !paymentIntentInfo.payment_id) {
            throw new common_1.BadRequestException('Order or payment intent information is missing.');
        }
        try {
            const response = await this.razorpayService.verifyOrder(paymentIntentInfo.payment_id);
            if (response.payment.status === 'captured') {
                order.payment_status = order_entity_1.PaymentStatusType.PAID;
                order.order_status = order_entity_1.OrderStatusType.COMPLETED;
                await this.orderRepository.save(order);
                await this.sendOrderConfirmation(order);
                return true;
            }
            else {
                console.warn(`Payment status is not captured. Status: ${response.payment.status}`);
                return false;
            }
        }
        catch (error) {
            console.error('Failed to process Razorpay payment:', error.message || error);
            throw new common_1.InternalServerErrorException('Failed to process Razorpay payment');
        }
    }
    async sendOrderConfirmation(order) {
        try {
            const user = await this.userRepository.findOne({ where: { id: order.customer_id || order.customer.id } });
            await this.mailService.sendOrderConfirmation(order, user);
        }
        catch (error) {
            console.error('Failed to send order confirmation email:', error.message || error);
        }
    }
    async changeOrderPaymentStatus(order, paymentStatus) {
        try {
            order.payment_status = paymentStatus;
            await this.orderRepository.save(order);
        }
        catch (error) {
            console.error('Failed to change order payment status:', error.message || error);
            throw new common_1.InternalServerErrorException('Failed to change order payment status');
        }
    }
};
OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(9, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(10, (0, typeorm_1.InjectRepository)(order_status_entity_1.OrderStatus)),
    __param(11, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(12, (0, typeorm_1.InjectRepository)(address_entity_1.UserAdd)),
    __param(13, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(14, (0, typeorm_1.InjectRepository)(order_entity_1.OrderFiles)),
    __param(15, (0, typeorm_1.InjectRepository)(product_entity_1.File)),
    __param(16, (0, typeorm_1.InjectRepository)(payment_intent_entity_1.PaymentIntentInfo)),
    __param(17, (0, typeorm_1.InjectRepository)(payment_intent_entity_1.PaymentIntent)),
    __param(18, (0, typeorm_1.InjectRepository)(product_entity_1.OrderProductPivot)),
    __param(19, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(20, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __param(21, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        analytics_service_1.AnalyticsService,
        stripe_payment_service_1.StripePaymentService,
        paypal_payment_service_1.PaypalPaymentService,
        razorpay_payment_service_1.RazorpayService,
        shiprocket_service_1.ShiprocketService,
        mail_service_1.MailService,
        stocks_service_1.StocksService,
        notifications_service_1.NotificationService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object, cacheService_1.CacheService,
        typeorm_2.DataSource])
], OrdersService);
exports.OrdersService = OrdersService;
//# sourceMappingURL=orders.service.js.map
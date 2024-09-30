import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DeepPartial, In, Repository } from 'typeorm';
import { InventoryStocks, Stocks } from './entities/stocks.entity';
import { CreatestockOrderDto } from './dto/create-stock.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserType } from 'src/users/entities/user.entity';
import { Dealer } from 'src/users/entities/dealer.entity';
import { Order, OrderStatusType, PaymentGatewayType, PaymentStatusType } from 'src/orders/entities/order.entity';
import { StocksSellOrd } from './entities/stocksOrd.entity';
import { plainToClass } from 'class-transformer';
import { OrderStatus } from 'src/orders/entities/order-status.entity';
import { OrderProductPivot, Product, Variation } from 'src/products/entities/product.entity';
import { ShiprocketService } from 'src/orders/shiprocket.service';
import { MailService } from 'src/mail/mail.service';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { UserAdd } from 'src/address/entities/address.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { GetOrdersDto, OrderPaginator } from 'src/orders/dto/get-orders.dto';
import { Permission } from 'src/permission/entities/permission.entity';
import { paginate } from 'src/common/pagination/paginate';
import { NotificationService } from 'src/notifications/services/notifications.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class StocksService {
    constructor(
        private readonly shiprocketService: ShiprocketService,
        private readonly MailService: MailService,
        private readonly notificationService: NotificationService,

        @InjectRepository(Stocks)
        private readonly stocksRepository: Repository<Stocks>,
        @InjectRepository(InventoryStocks)
        private readonly inventoryStocksRepository: Repository<InventoryStocks>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Dealer)
        private readonly dealerRepository: Repository<Dealer>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(StocksSellOrd)
        private readonly StocksSellOrdRepository: Repository<StocksSellOrd>,
        @InjectRepository(OrderProductPivot)
        private readonly orderProductPivotRepository: Repository<OrderProductPivot>,
        @InjectRepository(OrderStatus)
        private readonly orderStatusRepository: Repository<OrderStatus>,
        @InjectRepository(Coupon)
        private readonly couponRepository: Repository<Coupon>,
        @InjectRepository(UserAdd)
        private readonly userAddressRepository: Repository<UserAdd>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
        @InjectRepository(Variation)
        private readonly variationRepository: Repository<Variation>,
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,

    ) { }

    async create(createStocksDto: any): Promise<Stocks[]> {
        try {
            const { user_id, order_id, products } = createStocksDto;

            // Find dealer
            const dealer = await this.userRepository.findOne({
                where: { id: user_id },
                relations: ['dealer'],
            });
            if (!dealer?.dealer) {
                throw new NotFoundException(`Dealer not found by ID ${user_id}`);
            }

            // Find order
            const orderEntity = await this.orderRepository.findOne({
                where: { id: order_id },
            });
            if (!orderEntity) {
                throw new NotFoundException(`Order not found by ID ${order_id}`);
            }

            const updatedStocks: Stocks[] = [];

            for (const product of products) {
                if (!product.product_id || !order_id) {
                    throw new NotFoundException(`Product id or Order id is not defined`);
                }

                // Find product
                const productEntity = await this.productRepository.findOne({
                    where: { id: product.product_id },
                });
                if (!productEntity) {
                    throw new NotFoundException(`Product not found by ID ${product.product_id}`);
                }

                // Find variation options if provided
                const variationOptions = product.variation_option_id
                    ? await this.variationRepository.findOne({
                        where: { id: product.variation_option_id },
                    })
                    : null;

                // Create and save stock
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

                // Update inventory stocks
                await this.updateInventoryStocks({
                    user_id: dealer.id,
                    product_id: productEntity.id,
                    variation_option_id: variationOptions ? variationOptions.id : null,
                    orderedQuantity: product.order_quantity,
                });
            }

            return updatedStocks;
        } catch (error) {
            throw new NotFoundException(`Error creating stocks: ${error.message}`);
        }
    }

    async updateInventoryStocks(createStocksDto: any): Promise<InventoryStocks[]> {
        try {
            const { user_id, product_id, variation_option_id, orderedQuantity } = createStocksDto;
            let existingStock = await this.inventoryStocksRepository.findOne({
                where: {
                    user: { id: parseInt(user_id) },
                    product: { id: parseInt(product_id) },
                    variation_options: { id: parseInt(variation_option_id) || -1 }, // Use -1 for non-existing ID
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
            } else {
                existingStock.quantity += orderedQuantity;
                existingStock.status = existingStock.quantity > 2;
                existingStock.inStock = existingStock.quantity > 2;
                await this.inventoryStocksRepository.save(existingStock);
            }
            return [existingStock];
        } catch (error) {
            throw new NotFoundException(`Error updating inventory stock: ${error.message}`);
        }
    }



    //update-stocks quantity by Admin and Dealer

    async updateStocksbyAdmin(user_id: number, updateStkQuantityDto: any) {
        try {
            const { updateDispatchQuant, order_id, product_id, variation_option_id } = updateStkQuantityDto;

            if (!user_id || !product_id) {
                throw new NotFoundException(`User id or Product id is not defined`);
            }

            const dealer = await this.userRepository.findOne({ where: { id: user_id }, relations: ['dealer'] });

            if (!dealer?.dealer) {
                throw new NotFoundException(`Dealer not found by ID ${user_id}`);
            }

            const existingStock = await this.stocksRepository.findOne({ where: { user: { id: dealer.id }, product: { id: product_id }, order: { id: order_id }, variation_options: variation_option_id } });

            if (!existingStock) {
                throw new NotFoundException(`Stock not found for user ID ${user_id} and product ID ${product_id} for order ${order_id}`);
            }

            if (existingStock.orderedQuantity < updateDispatchQuant) {
                throw new Error(`Dispatch quantity is greater than the ordered quantity for order ${order_id}`);
            }

            existingStock.ordPendQuant = existingStock.ordPendQuant - updateDispatchQuant;
            existingStock.dispatchedQuantity = existingStock.dispatchedQuantity + updateDispatchQuant;

            await this.stocksRepository.save(existingStock);

        } catch (error) {
            throw new Error(`Error updating stock: ${error.message}`);
        }
    }

    // async updateInventoryStocksByDealer(user_id: number, updateStkQuantityDto: any) {
    //     try {
    //         const { receivedQuantity, order_id, product_id, variation_option_id } = updateStkQuantityDto;

    //         // Validate presence of required parameters
    //         if (!user_id || !product_id || !order_id || !variation_option_id) {
    //             throw new NotFoundException('User id, Product id, Order id, and Variation option id must be defined');
    //         }

    //         const dealer = await this.userRepository.findOne({
    //             where: { id: user_id },
    //             relations: ['dealer'],
    //         });

    //         if (!dealer?.dealer) {
    //             throw new NotFoundException(`Dealer not found by ID ${user_id}`);
    //         }

    //         const existingStock = await this.stocksRepository.findOne({
    //             where: {
    //                 user: { id: dealer.id },
    //                 product: { id: product_id },
    //                 order: { id: order_id },
    //                 variation_options: { id: variation_option_id }
    //             }
    //         });

    //         if (!existingStock) {
    //             throw new NotFoundException(`Stock not found for user ID ${user_id}, product ID ${product_id}, order ID ${order_id}, and variation option ID ${variation_option_id}`);
    //         }

    //         if (existingStock.dispatchedQuantity < receivedQuantity) {
    //             throw new Error(`Received quantity is greater than the dispatched quantity for user ID ${user_id}`);
    //         }

    //         const inventoryStockRep = await this.inventoryStocksRepository.findOne({
    //             where: {
    //                 user: { id: dealer.id },
    //                 product: { id: product_id },
    //                 variation_options: { id: variation_option_id }
    //             }
    //         });

    //         if (inventoryStockRep) {
    //             inventoryStockRep.quantity += receivedQuantity;
    //             if (inventoryStockRep.quantity > 1) {
    //                 inventoryStockRep.status = true;
    //                 inventoryStockRep.inStock = true;
    //             }
    //             await this.inventoryStocksRepository.save(inventoryStockRep);
    //         } else {
    //             const newInventoryStock = new InventoryStocks();
    //             newInventoryStock.quantity = receivedQuantity;
    //             newInventoryStock.product = await this.productRepository.findOne({ where: { id: product_id } });
    //             newInventoryStock.user = dealer;
    //             newInventoryStock.variation_options = [await this.variationRepository.findOne({ where: { id: variation_option_id } })];
    //             if (newInventoryStock.quantity > 1) {
    //                 newInventoryStock.status = true;
    //                 newInventoryStock.inStock = true;
    //             }
    //             await this.inventoryStocksRepository.save(newInventoryStock);
    //         }

    //         existingStock.receivedQuantity = existingStock.receivedQuantity + receivedQuantity;
    //         existingStock.dispatchedQuantity = existingStock.dispatchedQuantity - receivedQuantity;

    //         await this.stocksRepository.save(existingStock);

    //     } catch (error) {
    //         throw new Error(`Error updating stock: ${error.message}`);
    //     }
    // }

    async updateInventoryStocksByDealer(user_id: number, updateStkQuantityDto: any) {
        try {
            const { receivedQuantity, order_id, product_id, variation_option_id } = updateStkQuantityDto;

            if (!user_id || !product_id) {
                throw new NotFoundException(`User id or Product id is not defined`);
            }

            const dealer = await this.userRepository.findOne({ where: { id: user_id }, relations: ['dealer'] });

            if (!dealer?.dealer) {
                throw new NotFoundException(`Dealer not found by ID ${user_id}`);
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
                throw new NotFoundException(`Stock not found for user ID ${user_id} and product ID ${product_id} for order ${order_id}`);
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
            } else {
                const newInventoryStock = new InventoryStocks();
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

        } catch (error) {
            throw new Error(`Error updating stock: ${error.message}`);
        }
    }

    async getAll(user_id: number, order_id: number): Promise<Stocks[]> {
        try {
            if (!user_id || !order_id) {
                throw new NotFoundException(`User ID or Order ID is not defined`);
            }

            // Generate a unique cache key based on user_id and order_id
            const cacheKey = `stocks_${user_id}_${order_id}`;

            // Check if the data is already cached
            const cachedResult = await this.cacheManager.get<Stocks[]>(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }

            // Fetch all stocks for the given user and order
            const stocks = await this.stocksRepository.find({
                where: {
                    user: { id: user_id },
                    order: { id: order_id }
                },
                relations: ['product', 'order', 'user', 'variation_options']
            });

            // Cache the result for future requests
            await this.cacheManager.set(cacheKey, stocks, 60); // Cache for 5 minutes

            return stocks;

        } catch (error) {
            throw new NotFoundException(`Error fetching stocks: ${error.message}`);
        }
    }


    async getAllStocks(user_id: number) {
        try {
            if (!user_id) {
                throw new NotFoundException(`User id is not defined`);
            }

            // Generate a unique cache key based on the user_id
            const cacheKey = `stocks_${user_id}`;

            // Check if the data is already cached
            const cachedResult = await this.cacheManager.get(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }

            // Fetch all dealers associated with the given user
            const dealerList = await this.userRepository.find({
                where: [
                    { createdBy: { id: user_id } },
                    { id: user_id }
                ],
                select: ['id']
            });

            const allStocks = [];

            for (const dealer of dealerList) {
                // Fetch all stocks for each dealer
                const dealerStocks = await this.stocksRepository.find({
                    where: { user: { id: dealer.id } },
                    relations: ['product', 'order', 'user', 'variation_options']
                });

                if (dealerStocks.length > 0) {
                    // Flatten the array of stocks objects into a single array
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

                    // Create an object with user property and the flattened stocks array
                    const obj = {
                        user: dealerStocks[0].user, // Assuming `dealerStocks[0].user` represents the user
                        stocks: stocks
                    };

                    allStocks.push(obj);
                }
            }

            // Cache the result for future requests
            await this.cacheManager.set(cacheKey, allStocks, 60); // Cache for 5 minutes

            return allStocks;

        } catch (error) {
            throw new NotFoundException(`Error fetching stocks: ${error.message}`);
        }
    }

    // Dealer Invantory Stocks Products

    async getDealerInventoryStocks(userId: number): Promise<any> {
        try {
            if (!userId) {
                throw new NotFoundException(`User ID is not defined`);
            }

            // Generate a unique cache key based on userId
            const cacheKey = `inventory_stocks_${userId}`;

            // Check if the data is already cached
            const cachedResult = await this.cacheManager.get<any[]>(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }

            // Fetch all inventory stocks for the given dealer (user)
            const inventoryStocks = await this.inventoryStocksRepository.find({
                where: { user: { id: userId } },
                relations: ['product', 'variation_options', 'user'],
            });

            if (inventoryStocks.length === 0) {
                throw new NotFoundException(`No inventory stocks found for user ID ${userId}`);
            }

            // Map the inventory stocks to include the necessary details
            const result = inventoryStocks.map(stock => ({
                id: stock.id,
                quantity: stock.quantity,
                status: stock.status,
                inStock: stock.inStock,
                product: stock.product,
                variation_options: stock.variation_options,
            }));

            // Cache the result for future requests
            await this.cacheManager.set(cacheKey, result, 60); // Cache for 5 minutes

            return result;

        } catch (error) {
            throw new NotFoundException(`Error fetching inventory stocks: ${error.message}`);
        }
    }

    async afterORD(createOrderDto: any): Promise<any> {
        try {
            const existingStocks = await this.inventoryStocksRepository.find({
                where: {
                    user: { id: Number(createOrderDto.dealerId) },
                    product: { id: In(createOrderDto.products.map(product => product.product_id)) }
                },
                relations: ['product', 'variation_options'],
            });

            for (const orderProduct of createOrderDto.products) {
                const stock = existingStocks.find(s => s.product.id === orderProduct.product_id);

                if (!stock) {
                    throw new NotFoundException(`Stock with product ID ${orderProduct.product_id} not found for user ${createOrderDto.dealerId}`);
                }
                if (stock.quantity >= orderProduct.order_quantity) {
                    stock.quantity -= orderProduct.order_quantity;
                } else {
                    throw new NotFoundException(`This Product ${orderProduct.product_id} is out of stock`);
                }

                // Ensure stock is of the correct type
                const updatedStock: DeepPartial<InventoryStocks> = {
                    ...stock,
                    variation_options: stock.variation_options.map(variation => ({ ...variation })) as DeepPartial<Variation>[]
                };
                await this.inventoryStocksRepository.save(updatedStock);
            }
        } catch (error) {
            throw new NotFoundException(`Error updating stock after order: ${error.message}`);
        }
    }

    async OrdfromStocks(createOrderInput: CreatestockOrderDto): Promise<StocksSellOrd> {
        try {
            // Transform input to StocksSellOrd entity
            const order = plainToClass(StocksSellOrd, createOrderInput);

            // Set default order status
            const newOrderStatus = new OrderStatus();
            newOrderStatus.name = 'Order Processing';
            newOrderStatus.color = '#d87b64';
            const paymentGatewayType = createOrderInput.payment_gateway
                ? createOrderInput.payment_gateway
                : PaymentGatewayType.CASH_ON_DELIVERY;
            order.payment_gateway = paymentGatewayType;

            // Set customer information
            order.customerId = order.customerId ? order.customerId : order.customer_id;
            order.customer_id = order.customer_id;
            order.customer = createOrderInput.dealerId ? createOrderInput.dealerId : null;

            // Set order status based on payment gateway type
            switch (paymentGatewayType) {
                case PaymentGatewayType.CASH_ON_DELIVERY:
                    order.order_status = OrderStatusType.PROCESSING;
                    order.payment_status = PaymentStatusType.CASH_ON_DELIVERY;
                    newOrderStatus.slug = OrderStatusType.PROCESSING;
                    break;
                case PaymentGatewayType.CASH:
                    order.order_status = OrderStatusType.PROCESSING;
                    order.payment_status = PaymentStatusType.CASH;
                    newOrderStatus.slug = OrderStatusType.PROCESSING;
                    break;
                case PaymentGatewayType.FULL_WALLET_PAYMENT:
                    order.order_status = OrderStatusType.COMPLETED;
                    order.payment_status = PaymentStatusType.WALLET;
                    newOrderStatus.slug = OrderStatusType.COMPLETED;
                    break;
                default:
                    order.order_status = OrderStatusType.PENDING;
                    order.payment_status = PaymentStatusType.PENDING;
                    newOrderStatus.slug = OrderStatusType.PENDING;
                    break;
            }

            // Verify customer existence
            if (order.customer_id && order.customer) {
                const customer = await this.userRepository.findOne({
                    where: { id: order.customer_id, email: order.customer.email }, relations: ['permission']
                });
                if (!customer) {
                    throw new NotFoundException('Customer not found');
                }
                order.customer = customer;
            }

            // Generate invoice number if not provided
            const Invoice = "OD" + Math.floor(Math.random() * Date.now());
            order.tracking_number = order.tracking_number || Invoice;

            // Validate products in the order
            if (!order.products || order.products.some(product => product.product_id === undefined)) {
                throw new Error('Invalid order.products');
            }

            // Save the order
            const savedOrder = await this.StocksSellOrdRepository.save(order);

            // Process products in the order
            if (order.products) {
                const productEntities = await this.productRepository.find({
                    where: { id: In(order.products.map(product => product.product_id)) },
                });
                if (productEntities.length > 0) {
                    for (const product of order.products) {
                        if (product) {
                            const newPivot = new OrderProductPivot();
                            newPivot.order_quantity = product.order_quantity;
                            newPivot.unit_price = product.unit_price;
                            newPivot.subtotal = product.subtotal;
                            newPivot.variation_option_id = product.variation_option_id;
                            newPivot.Ord_Id = savedOrder.id;  // Use the saved order ID
                            const productEntity = productEntities.find(entity => entity.id === product.product_id);
                            newPivot.product = productEntity;
                            newPivot.StocksSellOrd = savedOrder
                            await this.orderProductPivotRepository.save(newPivot);
                        }
                    }
                    order.products = productEntities;

                    return await this.StocksSellOrdRepository.save(order);

                } else {
                    throw new NotFoundException('Product not found');
                }
            }

            // Save order status
            const createdOrderStatus = await this.orderStatusRepository.save(newOrderStatus);
            order.status = createdOrderStatus;

            // Associate shop with the order
            if (createOrderInput.soldBy) {
                const getSoldBy = await this.userRepository.findOne({ where: { id: createOrderInput.soldBy.id } });
                if (getSoldBy) {
                    order.soldBy = getSoldBy;
                } else {
                    throw new NotFoundException('Shop not found');
                }
            }

            // Associate soldByUserAddress with the order
            if (createOrderInput.soldByUserAddress?.id) {
                const getSale = await this.userAddressRepository.findOne({ where: { id: createOrderInput.soldByUserAddress.id } });
                if (getSale) {
                    order.soldByUserAddress = getSale;
                } else {
                    throw new NotFoundException('Dealer shop not found');
                }
            }

            // Save the final order with all associations
            const finalSavedOrder = await this.StocksSellOrdRepository.save(order);

            // Dynamically create notification
            let notificationTitle: string = 'Order Created';
            let notificationMessage: string = `New order with ID ${savedOrder.id} has been successfully created.`;
            if (savedOrder.customer) {
                await this.notificationService.createNotification(
                    finalSavedOrder.customer.id,
                    notificationTitle,
                    notificationMessage,
                );
            }

            return finalSavedOrder;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    async getOrders({
        limit,
        page,
        customer_id,
        tracking_number,
        search,
        shop_id,
    }: GetOrdersDto): Promise<OrderPaginator> {
        try {
            if (!customer_id) {
                throw new BadRequestException('Customer ID is required');
            }

            const user = await this.userRepository.findOne({ where: { id: customer_id }, relations: ['permission', 'permission.permissions'] });
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Generate a unique cache key based on query parameters
            const cacheKey = `orders_${customer_id}_${tracking_number || ''}_${search || ''}_${shop_id || ''}_${limit || 15}_${page || 1}`;

            // Check if the data is cached
            const cachedResult = await this.cacheManager.get<OrderPaginator>(cacheKey);
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

            if (!(user.permission.type_name === UserType.Dealer || user.permission.type_name === UserType.Staff)) {
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

            const results = await Promise.all(
                data.map(async (order) => {
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
                })
            );

            const url = `/orders?search=${search}&limit=${limit}`;
            const paginatedResult = {
                data: results,
                ...paginate(totalCount, page, limit, results.length, url),
            };

            // Cache the result
            await this.cacheManager.set(cacheKey, paginatedResult, 60); // Cache for 5 minutes

            return paginatedResult;

        } catch (error) {
            console.error('Error in getOrders:', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(`Error in getOrders: ${error.message}`);
        }
    }

    async getOrderById(id: number): Promise<any> {
        try {
            // Generate a unique cache key based on the order ID or tracking number
            const cacheKey = `order_${id}`;

            // Check if the data is cached
            const cachedOrder = await this.cacheManager.get<any>(cacheKey);
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
                throw new NotFoundException('Order not found');
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

            // Cache the result
            await this.cacheManager.set(cacheKey, transformedOrder, 60); // Cache for 5 minutes

            return transformedOrder;
        } catch (error) {
            console.error('Error in getOrderByIdOrTrackingNumber:', error);
            throw error;
        }
    }

    async updateOrderStatus(id: number, updateOrderStatusDto: any): Promise<StocksSellOrd> {
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
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        order.order_status = updateOrderStatusDto.order_status;
        return this.StocksSellOrdRepository.save(order);
    }

    async updatePaymentStatus(id: number, updatePaymentStatusDto: any): Promise<StocksSellOrd> {
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
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        order.payment_status = updatePaymentStatusDto.payment_status;
        return this.StocksSellOrdRepository.save(order);
    }

}

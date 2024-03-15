import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Stocks } from './entities/stocks.entity';
import { CreateStocksDto, GetStocksDto, UpdateStkQuantityDto } from './dto/create-stock.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Dealer } from 'src/users/entities/dealer.entity';
import { error } from 'console';
import { throwError } from 'rxjs';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { Order, OrderStatusType, PaymentGatewayType, PaymentStatusType } from 'src/orders/entities/order.entity';
import { StocksSellOrd } from './entities/stocksOrd.entity';
import { plainToClass } from 'class-transformer';
import { OrderStatus } from 'src/orders/entities/order-status.entity';
import { OrderProductPivot, Product } from 'src/products/entities/product.entity';
import { ShiprocketService } from 'src/orders/shiprocket.service';
import { MailService } from 'src/mail/mail.service';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { UserAddress } from 'src/addresses/entities/address.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { GetOrdersDto, OrderPaginator } from 'src/orders/dto/get-orders.dto';
import { Permission } from 'src/permission/entities/permission.entity';
import { paginate } from 'src/common/pagination/paginate';

@Injectable()
export class StocksService {
    constructor(
        private readonly shiprocketService: ShiprocketService,
        private readonly MailService: MailService,

        @InjectRepository(Stocks)
        private readonly stocksRepository: Repository<Stocks>,
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
        @InjectRepository(UserAddress)
        private readonly userAddressRepository: Repository<UserAddress>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
    ) { }

    async create(createStocksDto: CreateStocksDto): Promise<Stocks[]> {
        try {
            const { user_id, products } = createStocksDto;

            const dealer = await this.userRepository.findOne({ where: { id: user_id }, relations: ['dealer'] })
            console.log('dealer****', dealer)
            if (!dealer?.dealer) {
                throw new NotFoundException(`Dealer not Found by ${user_id} ID`)
            }

            console.log('dealer****33', dealer)
            // Fetch existing stocks for the given user
            const existingStocks = await this.stocksRepository.find({
                where: { user: { id: user_id } },
                relations: ['product'],
            });

            const updatedStocks: Stocks[] = [];

            for (const product of products) {
                const existingStock = existingStocks.find(
                    (stock) => stock.product.id === product.product_id,
                );

                console.log("existingStock***", existingStock)

                if (!existingStock) {
                    // Create a new stock record for the product
                    const newStock = this.stocksRepository.create({
                        ordPendQuant: product.order_quantity,
                        status: false,
                        quantity: 0,
                        inStock: false,
                        product: product.product_id,
                        user: dealer,
                    });

                    updatedStocks.push(await this.stocksRepository.save(newStock));
                } else {
                    // Update existing stock record for the product
                    existingStock.ordPendQuant += product.order_quantity;
                    updatedStocks.push(await this.stocksRepository.save(existingStock));
                }
            }
            return updatedStocks;
        } catch (error) {
            throw new NotFoundException(`Error updating stock: ${error.message}`);
        }
    }

    async update(user_id: number, updateStkQuantityDto: UpdateStkQuantityDto) {
        try {
            const { inStock, ordPendQuant, quantity, status, product } = updateStkQuantityDto;

            const dealer = await this.userRepository.findOne({ where: { id: user_id }, relations: ['dealer'] })
            console.log('dealer****', dealer)
            if (!dealer?.dealer) {
                throw new NotFoundException(`Dealer not Found by ${user_id} ID`)
            }

            console.log('dealer****33', dealer)
            // Fetch existing stocks for the given user
            const existingStocks = await this.stocksRepository.findOne({
                where: { user: { id: user_id }, product: { id: product } },
                relations: ['product'],
            });

            const updatedStocks: Stocks[] = [];

            existingStocks.ordPendQuant = ordPendQuant;
            existingStocks.quantity = quantity;
            existingStocks.status = quantity === 0 ? false : status;
            existingStocks.inStock = quantity === 0 ? false : inStock;
            updatedStocks.push(await this.stocksRepository.save(existingStocks));

        } catch (error) {
            throw new NotFoundException(`Error updating stock: ${error.message}`);
        }
    }

    async getAll(user_id: number): Promise<Stocks[]> {
        try {
            return await this.stocksRepository.find({ where: { user: { id: user_id } }, relations: ['product'] });
        } catch (error) {
            throw new NotFoundException(`Error fetching stocks: ${error.message}`);
        }
    }


    async afterORD(createOrderDto: CreateOrderDto): Promise<any> {
        try {
            console.log(Number(createOrderDto.dealerId), " ****** ", createOrderDto.products)

            const existingStocks = await this.stocksRepository.find({
                where: { user: { id: Number(createOrderDto.dealerId) }, product: { id: In(createOrderDto.products.map(product => product.product_id)) } },
                relations: ['product'],
            });

            for (const orderProduct of createOrderDto.products) {
                const stock = existingStocks.find(s => s.product.id === orderProduct.product_id);

                console.log(orderProduct.order_quantity, " ****** order_quantity")

                console.log(stock.quantity, " ****** quantity")

                if (!stock) {
                    throw new NotFoundException(`Stock with product ID ${orderProduct.product_id} not found for user ${createOrderDto.dealerId}`);
                }
                if (stock.quantity >= orderProduct.order_quantity) {
                    stock.quantity -= orderProduct.order_quantity;
                } else {
                    throw new NotFoundException(`This Product ${orderProduct.product_id} Out of Stock`);
                }
                stock.inStock = stock.quantity > 0 ? true : false;
                stock.status = stock.quantity > 0 ? true : false;
                await this.stocksRepository.save(stock);
            }
        } catch (error) {
            throw new NotFoundException(`Error updating stock after order: ${error.message}`);
        }
    }


    async OrdfromStocks(createOrderInput: CreateOrderDto): Promise<StocksSellOrd> {
        try {
            console.log("createOrderInput***", createOrderInput)
            // throw error
            const order = plainToClass(StocksSellOrd, createOrderInput)
            const newOrderStatus = new OrderStatus();
            newOrderStatus.name = 'Order Processing';
            newOrderStatus.color = '#d87b64';
            const paymentGatewayType = createOrderInput.payment_gateway
                ? createOrderInput.payment_gateway
                : PaymentGatewayType.CASH_ON_DELIVERY;
            order.payment_gateway = paymentGatewayType;
            order.payment_intent = null;
            order.customerId = order.customerId ? order.customerId : order.customer_id;
            order.customer_id = order.customer_id;
            order.dealer = createOrderInput.dealerId ? createOrderInput.dealerId : null;
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
            if (order.customer_id && order.customer) {
                const customer = await this.userRepository.findOne({
                    where: { id: order.customer_id }, relations: ['type']
                });
                console.log("customer*****", customer)
                if (!customer) {
                    throw new NotFoundException('Customer not found');
                }
                order.customer = customer;
            }

            const Invoice = "OD" + Math.floor(Math.random() * Date.now());

            if (!order.products || order.products.some(product => product.product_id === undefined)) {
                throw new Error('Invalid order.products');
            }

            order.tracking_number = order.tracking_number || Invoice;

            await this.StocksSellOrdRepository.save(order);

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
                            newPivot.Ord_Id = order.id;
                            const productEntity = productEntities.find(entity => entity.id === product.product_id);
                            newPivot.product = productEntity;
                            await this.orderProductPivotRepository.save(newPivot);
                        }
                    }
                    order.products = productEntities;
                } else {
                    throw new NotFoundException('Product not found');
                }
            }

            const createdOrderStatus = await this.orderStatusRepository.save(newOrderStatus);
            order.status = createdOrderStatus;

            if (createOrderInput.coupon_id) {
                const getCoupon = await this.couponRepository.findOne({ where: { id: createOrderInput.coupon_id } });
                if (getCoupon) {
                    order.coupon = getCoupon;
                } else {
                    throw new NotFoundException('Coupon not found');
                }
            }

            if (createOrderInput.shop_id) {
                const getShop = await this.shopRepository.findOne({ where: { id: createOrderInput.shop_id.id } });
                if (getShop) {
                    order.shop_id = getShop;
                } else {
                    throw new NotFoundException('Shop not found');
                }
            }

            if (createOrderInput.saleBy?.id) {
                const getSale = await this.userAddressRepository.findOne({ where: { id: createOrderInput.saleBy.id } });
                if (getSale) {
                    order.saleBy = getSale;
                } else {
                    throw new NotFoundException('Dealer shop not found');
                }
            }

            const savedOrder = await this.StocksSellOrdRepository.save(order);

            // if (savedOrder?.id) {
            //     await this.downloadInvoiceUrl((savedOrder.id).toString())
            // }

            return savedOrder;
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

            console.log("Query********", limit,
                page,
                customer_id,
                tracking_number,
                search,
                shop_id,)

            const usr = await this.userRepository.findOne({ where: { id: customer_id }, relations: ['type'] });

            console.log("user*****", usr)
            if (!usr) {
                throw new Error('User not found');
            }

            // Fetch permissions for the user
            const permsn = await this.permissionRepository.findOneBy(usr.type);

            let query = this.StocksSellOrdRepository.createQueryBuilder('StocksSellOrd');
            query = query.leftJoinAndSelect('StocksSellOrd.status', 'status');
            query = query.leftJoinAndSelect('StocksSellOrd.dealer', 'dealer');
            query = query.leftJoinAndSelect('StocksSellOrd.billing_address', 'billing_address');
            query = query.leftJoinAndSelect('StocksSellOrd.shipping_address', 'shipping_address');
            query = query.leftJoinAndSelect('StocksSellOrd.customer', 'customer');
            query = query.leftJoinAndSelect('StocksSellOrd.products', 'products')
                .leftJoinAndSelect('products.pivot', 'pivot')
                .leftJoinAndSelect('products.taxes', 'taxes')
                .leftJoinAndSelect('products.variation_options', 'variation_options');
            // query = query.leftJoinAndSelect('StocksSellOrd.payment_intent', 'payment_intent')
            //     .leftJoinAndSelect('payment_intent.payment_intent_info', 'payment_intent_info');
            query = query.leftJoinAndSelect('StocksSellOrd.shop_id', 'shop');
            query = query.leftJoinAndSelect('StocksSellOrd.coupon', 'coupon');

            if (!(permsn && (permsn.type_name === 'Admin' || permsn.type_name === 'super_admin'))) {
                // If the user has other permissions, filter orders by customer_id
                const usrByIdUsers = await this.userRepository.find({
                    where: { UsrBy: { id: usr.id } }, relations: ['type']
                });

                const userIds = [usr.id, ...usrByIdUsers.map(user => user.id)];
                query = query.andWhere('order.customer.id IN (:...userIds)', { userIds });
            }

            // Handle additional filtering conditions
            if (shop_id && shop_id !== 'undefined') {
                query = query.andWhere('products.shop_id = :shopId', { shopId: Number(shop_id) });
            }

            if (search) {
                query = query.andWhere('(status.name ILIKE :searchValue OR order.fieldName ILIKE :searchValue)', {
                    searchValue: `%${search}%`,
                });
            }

            if (tracking_number) {
                query = query.andWhere('order.tracking_number = :trackingNumber', { trackingNumber: tracking_number });
            }

            // Handle pagination
            if (!page) page = 1;
            if (!limit) limit = 15;
            const startIndex = (page - 1) * limit;

            const [data, totalCount] = await query
                .skip(startIndex)
                .take(limit)
                .getManyAndCount();

            console.log("data*****", data)
            const results = await Promise.all(
                data.map(async (order) => {
                    const products = await Promise.all(order.products.map(async (product) => {
                        // Fetch pivot data for the current product based on the Ord_Id
                        const pivot = await this.orderProductPivotRepository.findOne({
                            where: {
                                product: { id: product.id },
                                Ord_Id: order.id, // Use Ord_Id instead of order.id
                            },
                        });

                        // If pivot is undefined, return null or handle appropriately
                        if (!pivot) {
                            return null; // Or handle this case appropriately
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
                            height: product.height ? product.height : null,
                            width: product.width ? product.width : null,
                            length: product.length ? product.length : null,
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
                            pivot: pivot, // Use the found pivot
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
                        cancelled_amount: order?.cancelled_amount,
                        language: order?.language,
                        coupon_id: order.coupon,
                        saleBy: order?.saleBy,
                        discount: order?.discount,
                        payment_gateway: order.payment_gateway,
                        shipping_address: order.shipping_address,
                        billing_address: order.billing_address,
                        logistics_provider: order.logistics_provider,
                        delivery_fee: order.delivery_fee,
                        delivery_time: order.delivery_time,
                        order_status: order.order_status,
                        payment_status: order.payment_status,
                        created_at: order.created_at,
                        payment_intent: order.payment_intent,
                        customer: {
                            id: order.customer.id,
                            name: order.customer.name,
                            email: order.customer.email,
                            email_verified_at: order.customer.email_verified_at,
                            created_at: order.customer.created_at,
                            updated_at: order.customer.updated_at,
                            is_active: order.customer.is_active,
                            shop_id: null
                        },
                        dealer: order.dealer ? order.dealer : null,
                        products: products.filter(product => product !== null), // Exclude products for which pivot data could not be fetched
                        // children: order.children,
                        wallet_point: order?.wallet_point
                    };
                })
            );

            console.log("Orders******", results)
            const url = `/orders?search=${search}&limit=${limit}`;
            return {
                data: results,
                ...paginate(totalCount, page, limit, results.length, url),
            };
        } catch (error) {
            console.error('Error in getOrders:', error);
            throw error; // rethrow the error for further analysis
        }
    }

}

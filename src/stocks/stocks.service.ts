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
                    where: { id: order.customer_id, email: order.customer.email }, relations: ['type']
                });
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

}

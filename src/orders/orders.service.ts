import exportOrderJson from '@db/order-export.json';
import orderFilesJson from '@db/order-files.json';
import orderInvoiceJson from '@db/order-invoice.json';
import orderStatusJson from '@db/order-statuses.json';
import ordersJson from '@db/orders.json';
import paymentGatewayJson from '@db/payment-gateway.json';
import paymentIntentJson from '@db/payment-intent.json';
import setting from '@db/settings.json';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { AuthService } from 'src/auth/auth.service';
import { paginate } from 'src/common/pagination/paginate';
import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity';
import { PaymentGateWay } from 'src/payment-method/entities/payment-gateway.entity';
import { PaypalPaymentService } from 'src/payment/paypal-payment.service';
import { StripePaymentService } from 'src/payment/stripe-payment.service';
import { Setting } from 'src/settings/entities/setting.entity';
import {
  CreateOrderStatusDto,
  UpdateOrderStatusDto,
} from './dto/create-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderFilesDto } from './dto/get-downloads.dto';
import {
  GetOrderStatusesDto,
  OrderStatusPaginator,
} from './dto/get-order-statuses.dto';
import { GetOrdersDto, OrderPaginator } from './dto/get-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  CheckoutVerificationDto,
  VerifiedCheckoutData,
} from './dto/verify-checkout.dto';
import { OrderStatus } from './entities/order-status.entity';
import {
  Order,
  OrderFiles,
  OrderStatusType,
  PaymentGatewayType,
  PaymentStatusType,
} from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Address } from 'src/addresses/entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';

const orders = plainToClass(Order, ordersJson);
const paymentIntents = plainToClass(PaymentIntent, paymentIntentJson);
const paymentGateways = plainToClass(PaymentGateWay, paymentGatewayJson);
const orderStatus = plainToClass(OrderStatus, orderStatusJson);

const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(orderStatus, options);

const orderFiles = plainToClass(OrderFiles, orderFilesJson);
const settings = plainToClass(Setting, setting);

@Injectable()
export class OrdersService {
  private orders: Order[] = orders;
  private orderStatus: OrderStatus[] = orderStatus;
  private orderFiles: OrderFiles[] = orderFiles;
  private setting: Setting = { ...settings };

  constructor(
    private readonly authService: AuthService,
    private readonly stripeService: StripePaymentService,
    private readonly paypalService: PaypalPaymentService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productrRepository: Repository<Product>,
    @InjectRepository(OrderFiles)
    private readonly orderFilesRepository: Repository<Order>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(PaymentIntent)
    private readonly paymentIntentRepository: Repository<PaymentIntent>,
  ) { }
  async create(createOrderInput: CreateOrderDto): Promise<Order> {
    // console.log("first", createOrderInput)
    const order = plainToClass(Order, createOrderInput);

    const newOrderStatus = new OrderStatus()
    const newOrderFile =  new OrderFiles()

    newOrderStatus.name = 'Order Processing'
    newOrderStatus.color = '#d87b64'
    // Set the order type and payment type
    const paymentGatewayType = createOrderInput.payment_gateway
      ? createOrderInput.payment_gateway
      : PaymentGatewayType.CASH_ON_DELIVERY;

    order.payment_gateway = paymentGatewayType;
    order.payment_intent = null;

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
  
    if (order.customer) {
      const customerIds = await this.userRepository.find({
        where: ({ name: order.customer.name, email: order.customer.email }),
      });
    
      if (customerIds.length > 0) {
        order.customer = customerIds[0];
        newOrderFile.customer_id= customerIds[0].id;// Assign the found customer to the order
      } else {
        // Handle the case where no matching customer is found
        throw new NotFoundException('Customer not found');
      }
    }

    if (order.products) {
      const productIds = await this.productrRepository.find({
        where: { name: order.products[0].name, product_type: order.products[0].product_type },
      });
    
      if (productIds.length > 0) {
        order.products.push(productIds[0]); 
      } else {
        // Handle the case where no matching product is found
        // You might want to throw an error or handle it according to your application logic
        throw new NotFoundException('Product not found');
      }
    }

    if (order.coupon) {
      const getCoupon = await this.couponRepository.findOne({ where: { id: order.coupon[0] } });
      console.log("first Coupon", getCoupon);
      
      if (getCoupon) {
        order.coupon = getCoupon;
      } 
    }

    if (order.payment_intent) {
      const paymentIntentId = await this.paymentIntentRepository.find({
        where: { id: order.payment_intent.id, payment_gateway: order.payment_gateway },
      });
    
      if (paymentIntentId.length > 0) {
        order.payment_intent=paymentIntentId[0]
      }
    }

    const createdOrderStatus = await this.orderStatusRepository.save(newOrderStatus);
    order.status = createdOrderStatus;
    order.children = this.processChildrenOrder(order);

    try {
      if (
        [PaymentGatewayType.STRIPE, PaymentGatewayType.PAYPAL, PaymentGatewayType.RAZORPAY].includes(paymentGatewayType)
      ) {
        const paymentIntent = await this.processPaymentIntent(order, this.setting);
        order.payment_intent = paymentIntent;
      }
      const savedOrder = await this.orderRepository.save(order);
      newOrderFile.order_id = savedOrder.id;
      
      await this.orderFilesRepository.save(newOrderFile);
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
      if (!page) page = 1;
      if (!limit) limit = 15;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
  
      let query = this.orderRepository.createQueryBuilder('order');
  
      // Join OrderStatus entity
      query = query.leftJoinAndSelect('order.status', 'status');
  
      // Join Customer entity (assuming there is a relationship between order and customer)
      query = query.leftJoinAndSelect('order.customer', 'customer');
  
      // Join Product entity (assuming there is a relationship between order and products)
      query = query.leftJoinAndSelect('order.products', 'products');
  
      // Add additional joins for other related entities as needed
  
      if (shop_id && shop_id !== 'undefined') {
        // Use the correct column name in the WHERE clause
        query = query.where('order.shop_id = :shopId', { shopId: Number(shop_id) });
      }
  
      if (search) {
        // Update search conditions based on your entity fields
        query = query.andWhere('(status.name ILIKE :searchValue OR order.fieldName ILIKE :searchValue)', { searchValue: `%${search}%` });
      }
  
      if (customer_id) {
        query = query.andWhere('order.customer_id = :customerId', { customerId: customer_id });
      }
  
      if (tracking_number) {
        query = query.andWhere('order.tracking_number = :trackingNumber', { trackingNumber: tracking_number });
      }
  
      const [data, totalCount] = await query
        .skip(startIndex)
        .take(limit)
        .getManyAndCount();
  
      const results = data.slice(0, endIndex);
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
  
  



  private async updateOrderInDatabase(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const updateOrder = await this.findOrderInDatabase(id); 

    // Update the review entity with the new data
    Object.assign(updateOrder, updateOrderDto);

    // Save the updated review to the database
    return await this.orderRepository.save(updateOrder);
  }

  

  async getOrderByIdOrTrackingNumber(id: number): Promise<Order> {
    try {
      return (
        this.orders.find(
          (o: Order) =>
            o.id === Number(id) || o.tracking_number === id.toString(),
        ) ?? this.orders[0]
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getOrderStatuses({
    limit,
    page,
    search,
    orderBy,
  }: GetOrderStatusesDto): Promise<OrderStatusPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let query = this.orderStatusRepository.createQueryBuilder('orderStatus');

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // Update the query conditions based on your entity fields
        // query = query.andWhere(`orderStatus.${key} = :value`, { value });
      }
    }

    const [data, totalCount] = await query
      .skip(startIndex)
      .take(limit)
      .getManyAndCount();

    const results = data.slice(0, endIndex);
    const url = `/order-status?search=${search}&limit=${limit}`;

    return {
      data: results,
      ...paginate(totalCount, page, limit, results.length, url),
    };
  }

  async getOrderStatus(param: string, language: string): Promise<OrderStatus> {
    return this.orderStatusRepository.findOne({ where: { slug: param } });
  }

  async update(id: number, updateOrderInput: UpdateOrderDto): Promise<Order> {
    return await this.updateOrderInDatabase(id, updateOrderInput);
  }


  async remove(id: number): Promise<void> {
    const orderToDelete = await this.findOrderInDatabase(id);
    const orderStatusToDelete = await this.findOrderStatusInDatabase(id);

    if (!orderToDelete) {
      await this.orderStatusRepository.remove(orderStatusToDelete);
    }

    if (!orderStatusToDelete) {
      await this.orderRepository.remove(orderToDelete);
    }

  }


  private async findOrderInDatabase(id: number): Promise<Order | undefined> {
    return this.orderRepository.findOne({ where: { id: id } });
  }

  private async findOrderStatusInDatabase(id: number): Promise<OrderStatus | undefined> {
    return this.orderStatusRepository.findOne({ where: { id: id } });
  }


  verifyCheckout(input: CheckoutVerificationDto): VerifiedCheckoutData {
    return {
      total_tax: 0,
      shipping_charge: 0,
      unavailable_products: [],
      wallet_currency: 0,
      wallet_amount: 0,
    };
  }

  private async updateOrderStatusInDatabase(id: number, updateOrderStatusInput: UpdateOrderStatusDto): Promise<OrderStatus> {
    const orderStatus = await this.findOrderStatusInDatabase(id);

    // Update the order status entity with the new data
    Object.assign(orderStatus, updateOrderStatusInput);

    // Save the updated order status to the database
    return await this.orderStatusRepository.save(orderStatus);
  }



  async createOrderStatus(createOrderStatusInput: CreateOrderStatusDto): Promise<OrderStatus> {
    console.log("first", createOrderStatusInput)
    return
    // const orderStatus = this.orderStatusRepository.create(createOrderStatusInput);
    // return await this.orderStatusRepository.save(orderStatus);
  }

  async updateOrderStatus(id: number, updateOrderStatusInput: UpdateOrderStatusDto): Promise<OrderStatus> {
    return await this.updateOrderStatusInDatabase(id, updateOrderStatusInput);
  }

  async getOrderFileItems({ page, limit }: GetOrderFilesDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = orderFiles.slice(startIndex, endIndex);

    const url = `/downloads?&limit=${limit}`;
    return {
      data: results,
      ...paginate(orderFiles.length, page, limit, results.length, url),
    };
  }

  async getDigitalFileDownloadUrl(digitalFileId: number) {
    const item: OrderFiles = this.orderFiles.find(
      (singleItem) => singleItem.digital_file_id === digitalFileId,
    );

    return item.file.url;
  }

  async exportOrder(shop_id: string) {
    return exportOrderJson.url;
  }

  async downloadInvoiceUrl(shop_id: string) {
    return orderInvoiceJson[0].url;
  }

  /**
   * helper methods from here
   */

  /**
   * this method will process children of Order Object
   * @param order
   * @returns Children[]
   */
  processChildrenOrder(order: Order) {
    if (order.children && Array.isArray(order.children)) {
      return [...order.children].map((child) => {
        child.order_status = order.order_status;
        child.payment_status = order.payment_status;
        return child;
      });
    } else {
      return [];
    }
  }
  /**
   * This action will return Payment Intent
   * @param order
   * @param setting
   */
  async processPaymentIntent(
    order: Order,
    setting: Setting,
  ): Promise<PaymentIntent> {
    const paymentIntent = paymentIntents.find(
      (intent: PaymentIntent) =>
        intent.tracking_number === order.tracking_number &&
        intent.payment_gateway.toString().toLowerCase() ===
        setting.options.paymentGateway.toString().toLowerCase(),
    );
    if (paymentIntent) {
      return paymentIntent;
    }
    const {
      id: payment_id,
      client_secret = null,
      redirect_url = null,
      customer = null,
    } = await this.savePaymentIntent(order, order.payment_gateway);
    const is_redirect = redirect_url ? true : false;
    const paymentIntentInfo: PaymentIntent = {
      id: Number(Date.now()),
      order_id: order.id,
      tracking_number: order.tracking_number,
      payment_gateway: order.payment_gateway.toString().toLowerCase(),
      payment_intent_info: {
        client_secret,
        payment_id,
        redirect_url,
        is_redirect,
      },
    };

    /**
     * Commented below code will work for real database.
     * if you uncomment this for json will arise conflict.
     */

    // paymentIntents.push(paymentIntentInfo);
    // const paymentGateway: PaymentGateWay = {
    //   id: Number(Date.now()),
    //   user_id: this.authService.me().id,
    //   customer_id: customer,
    //   gateway_name: setting.options.paymentGateway,
    //   created_at: new Date(),
    //   updated_at: new Date(),
    // };
    // paymentGateways.push(paymentGateway);

    return paymentIntentInfo;
  }

  /**
   * Trailing method of ProcessPaymentIntent Method
   *
   * @param order
   * @param paymentGateway
   */
  async savePaymentIntent(order: Order, paymentGateway?: string): Promise<any> {
    const me = this.authService.me();
    switch (order.payment_gateway) {
      case PaymentGatewayType.STRIPE:
        const paymentIntentParam =
          await this.stripeService.makePaymentIntentParam(order, me);
        return await this.stripeService.createPaymentIntent(paymentIntentParam);
      case PaymentGatewayType.PAYPAL:
        // here goes PayPal
        return this.paypalService.createPaymentIntent(order);
        break;

      default:
        //
        break;
    }
  }

  /**
   *  Route {order/payment} Submit Payment intent here
   * @param order
   * @param orderPaymentDto
   */
  async stripePay(order: Order) {
    this.orders[0]['order_status'] = OrderStatusType.PROCESSING;
    this.orders[0]['payment_status'] = PaymentStatusType.SUCCESS;
    this.orders[0]['payment_intent'] = null;
  }

  async paypalPay(order: Order) {
    this.orders[0]['order_status'] = OrderStatusType.PROCESSING;
    this.orders[0]['payment_status'] = PaymentStatusType.SUCCESS;
    const { status } = await this.paypalService.verifyOrder(
      order.payment_intent.payment_intent_info.payment_id,
    );
    this.orders[0]['payment_intent'] = null;
    if (status === 'COMPLETED') {
      //console.log('payment Success');
    }
  }

  /**
   * This method will set order status and payment status
   * @param orderStatus
   * @param paymentStatus
   */
  changeOrderPaymentStatus(
    orderStatus: OrderStatusType,
    paymentStatus: PaymentStatusType,
  ) {
    this.orders[0]['order_status'] = orderStatus;
    this.orders[0]['payment_status'] = paymentStatus;
  }
}



import exportOrderJson from '@db/order-export.json';
import orderFilesJson from '@db/order-files.json';
import orderInvoiceJson from '@db/order-invoice.json';
import setting from '@db/settings.json';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { paginate } from 'src/common/pagination/paginate';
import { PaymentIntent, PaymentIntentInfo } from 'src/payment-intent/entries/payment-intent.entity';
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
import { In, Repository, UpdateResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { OrderProductPivot, Product } from 'src/products/entities/product.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { RazorpayService } from 'src/payment/razorpay-payment.service';

const orderFiles = plainToClass(OrderFiles, orderFilesJson);

@Injectable()
export class OrdersService {
  private orders: Order[]
  private orderFiles: OrderFiles[]

  constructor(
    private readonly authService: AuthService,
    private readonly stripeService: StripePaymentService,
    private readonly paypalService: PaypalPaymentService,
    private readonly razorpayService: RazorpayService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderFiles)
    private readonly orderFilesRepository: Repository<Order>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(PaymentIntentInfo)
    private readonly paymentIntentInfoRepository: Repository<PaymentIntentInfo>,
    @InjectRepository(PaymentIntent)
    private readonly paymentIntentRepository: Repository<PaymentIntent>,
    @InjectRepository(OrderProductPivot)
    private readonly orderProductPivotRepository: Repository<OrderProductPivot>,

  ) { }

  async create(createOrderInput: CreateOrderDto): Promise<Order> {
    const order = plainToClass(Order, createOrderInput);
    const newOrderStatus = new OrderStatus();
    const newOrderFile = new OrderFiles();
    newOrderStatus.name = 'Order Processing';
    newOrderStatus.color = '#d87b64';
    const paymentGatewayType = createOrderInput.payment_gateway
      ? createOrderInput.payment_gateway
      : PaymentGatewayType.CASH_ON_DELIVERY;
    order.payment_gateway = paymentGatewayType;
    order.payment_intent = null;
    order.customerId = order.customerId;
    order.customer_id = order.customerId;
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
    if (order.customerId && order.customer) {
      const customer = await this.userRepository.findOne({
        where: { id: order.customerId, email: order.customer.email },
      });
      if (customer) {
        order.customer = customer;
        newOrderFile.customer_id = customer.id;
      } else {
        throw new NotFoundException('Customer not found');
      }
    }
    const savedOrder = await this.orderRepository.save(order);
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
            newPivot.order_id = savedOrder;
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
    if (order.coupon) {
      const getCoupon = await this.couponRepository.findOne({ where: { id: order.coupon.id } });
      if (getCoupon) {
        order.coupon = getCoupon;
      }
    }
    try {
      if (
        [PaymentGatewayType.STRIPE, PaymentGatewayType.PAYPAL, PaymentGatewayType.RAZORPAY].includes(paymentGatewayType)
      ) {
        const paymentIntent = await this.processPaymentIntent(order);
        order.payment_intent = paymentIntent;
      }
      const createdOrderStatus = await this.orderStatusRepository.save(newOrderStatus);
      order.status = createdOrderStatus;
      order.tracking_number = order.id.toString();
      order.children = this.processChildrenOrder(order);
      const savedOrder = await this.orderRepository.save(order);
      newOrderFile.order_id = savedOrder.id;
      await this.orderFilesRepository.save(newOrderFile);
      console.log("Oreder_jaon****", newOrderFile)
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
      query = query.leftJoinAndSelect('order.billing_address', 'billing_address');
      query = query.leftJoinAndSelect('order.shipping_address', 'shipping_address');

      // Join Customer entity
      query = query.leftJoinAndSelect('order.customer', 'customer');

      // Join Product entity and its pivot
      query = query.leftJoinAndSelect('order.products', 'products')
        .leftJoinAndSelect('products.pivot', 'pivot');

      // Join PaymentIntent entity
      query = query.leftJoinAndSelect('order.payment_intent', 'payment_intent');

      // Add additional joins for other related entities as needed

      if (shop_id && shop_id !== 'undefined') {
        query = query.andWhere('products.shop_id = :shopId', { shopId: Number(shop_id) });
      }

      if (search) {
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
    try {
      // Find the order in the database
      const updateOrder = await this.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.status', 'status')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.products', 'products')
        .leftJoinAndSelect('products.pivot', 'pivot')
        .leftJoinAndSelect('order.payment_intent', 'payment_intent')
        .leftJoinAndSelect('payment_intent.payment_intent_info', 'payment_intent_info') // Add this line
        .leftJoinAndSelect('order.shop', 'shop')
        .leftJoinAndSelect('order.billing_address', 'billing_address')
        .leftJoinAndSelect('order.shipping_address', 'shipping_address')
        .leftJoinAndSelect('order.parentOrder', 'parentOrder')
        .leftJoinAndSelect('order.children', 'children')
        .leftJoinAndSelect('order.coupon', 'coupon')
        .where('order.id = :id', { id })
        .getOne();

      // If the order is not found, you can throw a NotFoundException
      if (!updateOrder) {
        throw new NotFoundException('Order not found');
      }

      // Update the order entity with the new data
      Object.assign(updateOrder, updateOrderDto);

      // Save the updated order to the database
      return await this.orderRepository.save(updateOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error; // Rethrow the error for further analysis or handling
    }
  }


  async getOrderByIdOrTrackingNumber(id: number): Promise<Order> {
    console.log("getOrderByIdOrTrackingNumber", id);
    try {
      const order = await this.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.status', 'status')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.products', 'products')
        .leftJoinAndSelect('products.pivot', 'pivot')
        .leftJoinAndSelect('order.payment_intent', 'payment_intent')
        .leftJoinAndSelect('payment_intent.payment_intent_info', 'payment_intent_info') // Add this line
        .leftJoinAndSelect('order.shop', 'shop')
        .leftJoinAndSelect('order.billing_address', 'billing_address')
        .leftJoinAndSelect('order.shipping_address', 'shipping_address')
        .leftJoinAndSelect('order.parentOrder', 'parentOrder')
        .leftJoinAndSelect('order.children', 'children')
        .leftJoinAndSelect('order.coupon', 'coupon')
        .where('order.id = :id', { id })
        .orWhere('order.tracking_number = :tracking_number', { tracking_number: id.toString() })
        .getOne();

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return order;
    } catch (error) {
      console.error('Error in getOrderByIdOrTrackingNumber:', error);
      throw error;
    }
  }


  async getOrderStatuses({
    limit = 30,
    page = 1,
    search,
    orderBy,
  }: GetOrderStatusesDto): Promise<OrderStatusPaginator> {
    const startIndex = (page - 1) * limit;

    // Construct the query builder
    let query = this.orderStatusRepository.createQueryBuilder('orderStatus');

    // Apply search filtering if search parameter is provided
    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // Update the query conditions based on your entity fields
        query = query.andWhere(`orderStatus.${key} LIKE :value`, { value: `%${value}%` });
      }
    }

    // Apply ordering if orderBy parameter is provided
    if (orderBy) {
      const [key, order] = orderBy.split(':');
      query = query.orderBy(`orderStatus.${key}`, order.toUpperCase() as ("ASC" | "DESC"));
    }

    const [data, totalCount] = await query
      .skip(startIndex)
      .take(limit)
      .getManyAndCount();

    const url = `/order-status?search=${search}&limit=${limit}&orderBy=${orderBy}`;

    return {
      data: data,
      ...paginate(totalCount, page, limit, data.length, url),
    };
  }


  async getOrderStatus(param: string, language: string): Promise<OrderStatus> {
    const orderStatus = await this.orderStatusRepository.findOne({
      where: {
        slug: param,
        language: language
      }
    });

    if (!orderStatus) {
      throw new NotFoundException('Order status not found');
    }

    return orderStatus;
  }



  async update(id: number, updateOrderInput: UpdateOrderDto): Promise<Order> {

    console.log("update-Order", id, updateOrderInput)
    try {
      // Update the order in the database
      const updatedOrder = await this.updateOrderInDatabase(id, updateOrderInput);

      // If the order is not found or not updated, throw an error
      if (!updatedOrder) {
        throw new NotFoundException('Order not found or not updated');
      }

      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error; // Rethrow the error for further analysis or handling
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // Find the order in the database
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

      // If the order is not found, you can throw a NotFoundException
      if (!orderToDelete) {
        throw new NotFoundException('Order not found');
      }

      // Remove the related data
      orderToDelete.status = null;
      orderToDelete.customer = null;
      orderToDelete.products = null;
      orderToDelete.payment_intent = null;
      orderToDelete.shop = null;
      orderToDelete.billing_address = null;
      orderToDelete.shipping_address = null;
      orderToDelete.parentOrder = null;
      orderToDelete.children = null;
      orderToDelete.coupon = null;

      // Save the updated order to the database
      await this.orderRepository.save(orderToDelete);

      // Remove the order from the database
      await this.orderRepository.remove(orderToDelete);
    } catch (error) {
      console.error('Error removing order:', error);
      throw error; // Rethrow the error for further analysis or handling
    }
  }

  private async findOrderInDatabase(id: number): Promise<Order | undefined> {
    return this.orderRepository.createQueryBuilder('order')
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
  }

  private async findOrderStatusInDatabase(id: number): Promise<OrderStatus | undefined> {
    return this.orderStatusRepository.findOne({ where: { id: id } });
  }



  async verifyCheckout(input: CheckoutVerificationDto): Promise<VerifiedCheckoutData> {
    // Initialize variables
    let total_tax = 0;
    let shipping_charge = 0;
    let unavailable_products: number[] = [];

    // Verify each product in the order
    for (const product of input.products) {
      // Fetch the product from the database
      const productEntity = await this.productRepository.findOne({ where: { id: product.product_id } });

      // Check if the product is available
      if (!productEntity || productEntity.stock < product.quantity) {
        unavailable_products.push(product.product_id);
      } else {
        // Calculate the total tax and shipping charge
        total_tax += productEntity.tax * product.quantity;
        shipping_charge += productEntity.shipping_fee;
      }
    }

    // Return the verified data
    return {
      total_tax,
      shipping_charge,
      unavailable_products,
      wallet_currency: 0, // Default value
      wallet_amount: 0, // Default value
    };
  }

  private async updateOrderStatusInDatabase(id: number, updateOrderStatusInput: UpdateOrderStatusDto): Promise<OrderStatus> {
    const orderStatus = await this.findOrderStatusInDatabase(id);

    // If the order status is not found, you can throw a NotFoundException
    if (!orderStatus) {
      throw new NotFoundException('Order status not found');
    }

    // Update the order status entity with the new data
    Object.assign(orderStatus, updateOrderStatusInput);

    // Save the updated order status to the database
    return await this.orderStatusRepository.save(orderStatus);
  }

  async createOrderStatus(createOrderStatusInput: CreateOrderStatusDto): Promise<OrderStatus> {
    console.log("first", createOrderStatusInput)

    // Create a new OrderStatus entity from the input data
    const orderStatus = this.orderStatusRepository.create(createOrderStatusInput);

    // Save the new OrderStatus to the database
    return await this.orderStatusRepository.save(orderStatus);
  }

  async updateOrderStatus(id: number, updateOrderStatusInput: UpdateOrderStatusDto): Promise<OrderStatus> {
    try {
      // Update the order status in the database
      const updatedOrderStatus = await this.updateOrderStatusInDatabase(id, updateOrderStatusInput);

      // If the order status is not found or not updated, throw an error
      if (!updatedOrderStatus) {
        throw new NotFoundException('Order status not found or not updated');
      }

      return updatedOrderStatus;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error; // Rethrow the error for further analysis or handling
    }
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

  async processPaymentIntent(order: Order): Promise<PaymentIntent> {
    try {
      const pI = await this.savePaymentIntent(order);
      console.log("pI********", pI)
      const is_redirect = pI.redirect_url ? true : false;
      let redirect_url = pI.redirect_url ? pI.redirect_url : null;
      const paymentIntentInfo = this.paymentIntentInfoRepository.create({
        order_id: pI.id,
        client_secret: pI.client_secret,
        redirect_url: redirect_url,
        is_redirect,
      });
      await this.paymentIntentInfoRepository.save(paymentIntentInfo);
      let paymentIntent = this.paymentIntentRepository.create({
        order_id: order.id,
        tracking_number: order.tracking_number ? order.tracking_number : order.id.toString(),
        payment_gateway: order.payment_gateway.toString().toLowerCase(),
        payment_intent_info: paymentIntentInfo,
      });
      await this.paymentIntentRepository.save(paymentIntent);
      return paymentIntent;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Trailing method of ProcessPaymentIntent Method
   *
   * @param order
   * @param _paymentGateway
   */
  async savePaymentIntent(order: Order, _paymentGateway?: string): Promise<any> {
    const usr = await this.userRepository.findOne({ where: { id: order.customer.id } });
    const me = this.authService.me(usr.email, usr.id);
    switch (order.payment_gateway) {
      case PaymentGatewayType.STRIPE:
        const paymentIntentParam =
          await this.stripeService.makePaymentIntentParam(order, await me);
        return await this.stripeService.createPaymentIntent(paymentIntentParam);
      case PaymentGatewayType.PAYPAL:
        // here goes PayPal
        return this.paypalService.createPaymentIntent(order);
      case PaymentGatewayType.RAZORPAY:
        // here goes PayPal
        return this.razorpayService.createPaymentIntent(order);
      default:
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
    console.log("paypalPay**", order);
    order.order_status = OrderStatusType.PROCESSING;
    try {
      const response = await this.paypalService.verifyOrder(order.payment_intent.payment_intent_info.order_id);
      console.log("response-paypal", order);
      if (response.status === 'COMPLETED') {
        console.log('Payment Success');
        order.payment_status = PaymentStatusType.SUCCESS;
        order.payment_intent = null;
      } else {
        console.log('Payment Failed');
        order.payment_status = PaymentStatusType.FAILED;
      }
      await this.orderRepository.save(order);
    } catch (error) {
      console.error('Failed to process payment:', error);
      order.order_status = OrderStatusType.FAILED;
      await this.orderRepository.save(order);
    }
  }

  async razorpayPay(order: Order, paymentIntentInfo: PaymentIntentInfo): Promise<boolean> {
    const response = await this.razorpayService.verifyOrder(paymentIntentInfo.payment_id);
    if (response.payment.status === 'captured') {
      return true;
    }
    return false;
  }

  async changeOrderPaymentStatus(order: Order, paymentStatus: PaymentStatusType): Promise<void> {
    order.payment_status = paymentStatus;
    await this.orderRepository.save(order);
  }


}


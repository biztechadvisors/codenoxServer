/* eslint-disable prettier/prettier */
import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { paginate } from 'src/common/pagination/paginate';
import { PaymentIntent, PaymentIntentInfo } from 'src/payment-intent/entries/payment-intent.entity';
import { PaypalPaymentService } from 'src/payment/paypal-payment.service';
import { StripePaymentService } from 'src/payment/stripe-payment.service';
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
import { In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { File, OrderProductPivot, Product } from 'src/products/entities/product.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { RazorpayService } from 'src/payment/razorpay-payment.service';
import { ShiprocketService } from 'src/orders/shiprocket.service';
import { stateCode } from 'src/taxes/state_code.tax';
import { Shop } from 'src/shops/entities/shop.entity';
import { MailService } from 'src/mail/mail.service';
import { StocksService } from 'src/stocks/stocks.service';
import { NotificationService } from 'src/notifications/services/notifications.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class OrdersService {
  constructor(
    private readonly authService: AuthService,
    private readonly stripeService: StripePaymentService,
    private readonly paypalService: PaypalPaymentService,
    private readonly razorpayService: RazorpayService,
    private readonly shiprocketService: ShiprocketService,
    private readonly mailService: MailService,
    private readonly stocksService: StocksService,
    private readonly notificationService: NotificationService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderFiles)
    private readonly orderFilesRepository: Repository<OrderFiles>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(PaymentIntentInfo)
    private readonly paymentIntentInfoRepository: Repository<PaymentIntentInfo>,
    @InjectRepository(PaymentIntent)
    private readonly paymentIntentRepository: Repository<PaymentIntent>,
    @InjectRepository(OrderProductPivot)
    private readonly orderProductPivotRepository: Repository<OrderProductPivot>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  async updateOrderQuantityProducts(ordProducts: any[]): Promise<void> {
    if (!ordProducts || ordProducts.length === 0) {
      throw new BadRequestException('No products provided.');
    }

    const productIds = ordProducts.map(product => product.product_id);
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['variation_options'],
    });

    if (products.length === 0) {
      throw new NotFoundException('Products not found');
    }

    try {
      const entityManager = this.productRepository.manager;
      for (const ordProduct of ordProducts) {
        const product = products.find(p => p.id === ordProduct.product_id);
        if (!product) {
          throw new NotFoundException(`Product with ID ${ordProduct.product_id} not found`);
        }

        const variation = ordProduct.variation_option_id
          ? product.variation_options.find(v => v.id === ordProduct.variation_option_id)
          : null;

        if (ordProduct.order_quantity > (variation ? variation.quantity : product.quantity)) {
          throw new BadRequestException(`Order quantity exceeds available quantity for product ID ${product.id}${variation ? ' and variation ID ' + variation.id : ''}`);
        }

        product.quantity -= ordProduct.order_quantity;
        await entityManager.save(product);

        if (variation) {
          variation.quantity -= ordProduct.order_quantity;
          await entityManager.save(variation);
        }
      }
    } catch (error) {
      console.error('Error updating product quantities:', error.message || error);
      throw new InternalServerErrorException('Failed to update product quantities');
    }
  }

  async create(createOrderInput: CreateOrderDto): Promise<Order> {
    const order = plainToClass(Order, createOrderInput);
    const paymentGatewayType = createOrderInput.payment_gateway || PaymentGatewayType.CASH_ON_DELIVERY;

    try {
      // Set payment gateway and order intent
      order.payment_gateway = paymentGatewayType;
      order.payment_intent = null;
      order.customerId = order.customerId || order.customer_id;
      order.customer_id = order.customer_id;
      order.dealer = createOrderInput.dealerId || null;

      // Ensure customer exists
      if (order.customerId) {
        const customer = await this.userRepository.findOne({
          where: { id: order.customerId },
        });
        if (!customer) {
          throw new NotFoundException('Customer not found');
        }
        order.customer = customer;
      }

      // Set order status
      await this.setOrderStatus(order, paymentGatewayType);

      const invoice = `OD${Math.floor(Math.random() * Date.now())}`;
      if (!order.products || order.products.some(product => product.product_id === undefined)) {
        throw new BadRequestException('Invalid order products');
      }

      const productEntities = await this.productRepository.find({
        where: { id: In(order.products.map(product => product.product_id)) },
      });

      if (productEntities.length === 0) {
        throw new NotFoundException('Product not found');
      }

      // Apply coupon if provided
      if (order.coupon) {
        await this.applyCoupon(order.coupon.code, order);
      }

      const orderData = this.createOrderData(order, productEntities, invoice);

      const shiprocketResponse = await this.shiprocketService.createOrder(orderData);
      if (!shiprocketResponse.shipment_id && !shiprocketResponse.order_id) {
        throw new InternalServerErrorException('Failed to create order in Shiprocket');
      }

      const savedOrder = await this.orderRepository.save(order);
      await this.createOrderFiles(savedOrder, productEntities);

      if (savedOrder.customerId === savedOrder.dealer) {
        const createStocksDto = {
          user_id: savedOrder.customerId,
          order_id: savedOrder.id,
          products: createOrderInput.products,
        };

        if (!createStocksDto.order_id) {
          throw new BadRequestException('Order ID is required');
        }

        await this.stocksService.create(createStocksDto);
      }

      if (savedOrder.customer) {
        await this.notificationService.createNotification(
          savedOrder.customer.id,
          'Order Created',
          `New order with ID ${savedOrder.id} has been successfully created.`,
        );
      }

      return savedOrder;
    } catch (error) {
      console.error('Error creating order:', error.message || error);
      throw new InternalServerErrorException('Failed to create order');
    }
  }


  private async createOrderFiles(order: Order, products: Product[]): Promise<void> {
    try {
      const orderFiles: OrderFiles[] = [];

      for (const product of products) {
        const file = new File();
        file.attachment_id = product.attachment_id;
        file.url = product.url;
        file.fileable_id = product.id;

        const savedFile = await this.fileRepository.save(file);

        const orderFile = new OrderFiles();
        orderFile.purchase_key = `PK_${Math.random().toString(36).substr(2, 9)}`;
        orderFile.digital_file_id = savedFile.id;
        orderFile.order_id = order.id;
        orderFile.customer_id = order.customer_id;
        orderFile.file = savedFile;
        orderFile.fileable = product;

        orderFiles.push(orderFile);
      }

      await this.orderFilesRepository.save(orderFiles);
    } catch (error) {
      console.error('Error creating order files:', error.message || error);
      throw new InternalServerErrorException('Failed to create order files');
    }
  }

  private async setOrderStatus(order: Order, paymentGatewayType: PaymentGatewayType) {
    let statusSlug: string;
    let paymentStatus: PaymentStatusType;

    switch (paymentGatewayType) {
      case PaymentGatewayType.CASH_ON_DELIVERY:
        statusSlug = OrderStatusType.PROCESSING;
        paymentStatus = PaymentStatusType.CASH_ON_DELIVERY;
        break;
      case PaymentGatewayType.CASH:
        statusSlug = OrderStatusType.PROCESSING;
        paymentStatus = PaymentStatusType.CASH;
        break;
      case PaymentGatewayType.FULL_WALLET_PAYMENT:
        statusSlug = OrderStatusType.COMPLETED;
        paymentStatus = PaymentStatusType.WALLET;
        break;
      default:
        statusSlug = OrderStatusType.PENDING;
        paymentStatus = PaymentStatusType.PENDING;
        break;
    }

    // Find the status entity
    const status = await this.orderStatusRepository.findOne({ where: { slug: statusSlug } });
    if (!status) {
      throw new NotFoundException(`Order status with slug ${statusSlug} not found`);
    }

    order.status = status;
    order.payment_status = paymentStatus;
  }

  private async applyCoupon(couponCode: string, order: Order): Promise<void> {
    const coupon = await this.couponRepository.findOne({ where: { code: couponCode } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (!coupon.is_valid || new Date(coupon.expire_at) < new Date()) {
      throw new BadRequestException('Coupon is invalid or expired');
    }

    if (order.total < coupon.minimum_cart_amount) {
      throw new BadRequestException('Order total does not meet the minimum cart amount required for the coupon');
    }

    order.total -= coupon.amount;
    order.coupon = coupon;
  }

  private createOrderData(order: Order, productEntities: Product[], invoice: string) {
    return {
      order_id: invoice,
      order_date: new Date().toISOString(),
      pickup_location: 'Primary',
      channel_id: '',
      comment: '',
      billing_customer_name: order.billing_address.name,
      billing_last_name: order.billing_address.lastName,
      billing_address: order.billing_address.street_address,
      billing_address_2: order.billing_address.ShippingAddress,
      billing_city: order.billing_address.city,
      billing_pincode: order.billing_address.zip,
      billing_state: order.billing_address.state,
      billing_country: order.billing_address.country,
      billing_email: order.customer?.email,
      billing_phone: order.customer_contact,
      shipping_is_billing: true,
      shipping_customer_name: order.shipping_address.name,
      shipping_last_name: order.shipping_address.lastName,
      shipping_address: order.shipping_address.street_address,
      shipping_address_2: order.shipping_address.ShippingAddress,
      shipping_city: order.shipping_address.city,
      shipping_pincode: order.shipping_address.zip,
      shipping_country: order.shipping_address.country,
      shipping_state: order.shipping_address.state,
      shipping_email: order.customer?.email,
      shipping_phone: order.customer_contact,
      order_items: productEntities.map((product, index) => ({
        name: product.name,
        sku: product.sku || Math.random().toString(),
        units: order.products[index].order_quantity,
        selling_price: product.sale_price,
        unit_price: order.products[index].unit_price,
        subtotal: order.products[index].subtotal,
        discount: product.discount || 0,
        tax: product.tax || 0,
        hsn: product.hsn || 0,
      })),
      payment_method: order.payment_gateway,
      shipping_charges: order.delivery_fee || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: order.discount || 0,
      sub_total: order.total,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1,
    };
  }

  async getOrders(getOrdersDto: GetOrdersDto): Promise<OrderPaginator> {
    try {
      const {
        limit = 15,
        page = 1,
        customer_id,
        tracking_number,
        search,
        shop_id,
        shopSlug,
        soldByUserAddress,
        type,
        startDate,
        endDate,
      } = getOrdersDto;

      const startIndex = (page - 1) * limit;
      const cacheKey = `orders-${page}-${limit}-${customer_id}-${tracking_number}-${search}-${shop_id}-${shopSlug}-${soldByUserAddress}-${type}-${startDate}-${endDate}`;
      let ordersCache = await this.cacheManager.get<OrderPaginator>(cacheKey);

      if (!ordersCache) {
        let query = this.orderRepository.createQueryBuilder('order')
          .leftJoinAndSelect('order.status', 'status')
          .leftJoinAndSelect('order.dealer', 'dealer')
          .leftJoinAndSelect('order.billing_address', 'billing_address')
          .leftJoinAndSelect('order.shipping_address', 'shipping_address')
          .leftJoinAndSelect('order.customer', 'customer')
          .leftJoinAndSelect('order.products', 'products')
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
        } else if (shopSlug) {
          const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
          if (!shop) throw new NotFoundException('Shop not found');
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

        const results = await Promise.all(
          data.map(async (order) => {
            const products = await Promise.all(
              order.products.map(async (product) => {
                let pivot = await this.orderProductPivotRepository.findOne({
                  where: {
                    product: { id: product.id },
                    Ord_Id: order.id,
                  },
                });

                // Return only the necessary fields directly without strict type checking
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

                return transformedPivot ? { ...product, pivot: transformedPivot } : null;
              })
            );

            return { ...order, products: products.filter((p) => p !== null) };
          })
        );

        const url = `/orders?search=${search || ''}&limit=${limit}`;
        ordersCache = {
          data: results,
          ...paginate(totalCount, page, limit, results.length, url),
        };

        await this.cacheManager.set(cacheKey, ordersCache, 3600); // Cache for 1 hour
      }

      return ordersCache;
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw new InternalServerErrorException('Failed to retrieve orders');
    }
  }

  async updateOrderInDatabase(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    try {
      const updateOrder = await this.orderRepository.findOne({
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

      if (!updateOrder) {
        throw new NotFoundException('Order not found');
      }

      Object.assign(updateOrder, updateOrderDto);
      return await this.orderRepository.save(updateOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      throw new InternalServerErrorException('Failed to update order');
    }
  }

  async getOrderByIdOrTrackingNumber(id: number): Promise<any> {
    try {
      const cacheKey = `order-${id}`;
      let order = await this.cacheManager.get<any>(cacheKey);

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
          .leftJoinAndSelect('order.products', 'products') // Ensure 'products' relation is selected
          .where('order.id = :id', { id })
          .orWhere('order.tracking_number = :tracking_number', { tracking_number: id.toString() })
          .getOne();

        if (!fetchedOrder) {
          throw new NotFoundException('Order not found');
        }

        order = this.transformOrder(fetchedOrder);
        await this.cacheManager.set(cacheKey, order, 3600);
      }

      return order;
    } catch (error) {
      console.error('Error in getOrderByIdOrTrackingNumber:', error);
      throw new InternalServerErrorException('Failed to retrieve order');
    }
  }

  private transformOrder(order: Order): any {
    // Collect pivots indexed by product id for quick lookup
    const pivotsByProductId = new Map<number, any>();

    if (order.orderProductPivots) {
      order.orderProductPivots.forEach((pivot) => {
        if (pivot && pivot.product) { // Ensure pivot and product exist
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
        const pivot = pivotsByProductId.get(product.id) || null; // Safeguard for pivot lookup
        return {
          ...product,
          pivot,
        };
      }),
    };
  }

  async getOrderStatuses({
    limit = 30,
    page = 1,
    search,
    orderBy,
  }: GetOrderStatusesDto): Promise<OrderStatusPaginator> {
    const startIndex = (page - 1) * limit;
    const cacheKey = `order-statuses-${page}-${limit}-${search || ''}-${orderBy || ''}`;
    let data = await this.cacheManager.get<OrderStatus[]>(cacheKey);
    if (!data) {
      let query = this.orderStatusRepository.createQueryBuilder('orderStatus');

      if (search) {
        const parseSearchParams = search.split(';');
        for (const searchParam of parseSearchParams) {
          const [key, value] = searchParam.split(':');
          query = query.andWhere(`orderStatus.${key} LIKE :value`, { value: `%${value}%` });
        }
      }

      if (orderBy) {
        const [key, order] = orderBy.split(':');
        query = query.orderBy(`orderStatus.${key}`, order.toUpperCase() as ("ASC" | "DESC"));
      }

      [data] = await query
        .skip(startIndex)
        .take(limit)
        .getManyAndCount();

      await this.cacheManager.set(cacheKey, data, 3600);
    }
    const totalCount = await this.orderStatusRepository.count();
    const url = `/order-status?search=${search || ''}&limit=${limit}&orderBy=${orderBy || ''}`;
    return {
      data,
      ...paginate(totalCount, page, limit, data.length, url),
    };
  }

  async getOrderStatus(param: string, language: string): Promise<OrderStatus> {
    const cacheKey = `order-status-${param}-${language}`;
    let orderStatus = await this.cacheManager.get<OrderStatus>(cacheKey);

    if (!orderStatus) {
      orderStatus = await this.orderStatusRepository.findOne({
        where: {
          slug: param,
          language: language
        }
      });

      if (!orderStatus) {
        throw new NotFoundException('Order status not found');
      }

      await this.cacheManager.set(cacheKey, orderStatus, 3600);
    }

    return orderStatus;
  }

  async update(id: number, updateOrderInput: UpdateOrderDto): Promise<Order> {
    try {

      const updatedOrder = await this.updateOrderInDatabase(id, updateOrderInput);

      if (!updatedOrder) {
        throw new NotFoundException('Order not found or not updated');
      }
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
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
        throw new NotFoundException('Order not found');
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
    } catch (error) {
      console.error('Error removing order:', error);
      throw error;
    }
  }

  private async findOrderStatusInDatabase(id: number): Promise<OrderStatus | undefined> {
    return this.orderStatusRepository.findOne({ where: { id: id } });
  }

  async verifyCheckout(input: CheckoutVerificationDto): Promise<VerifiedCheckoutData> {
    let total_tax = 0;
    let shipping_charge = 0;
    let unavailable_products: number[] = [];

    for (const product of input.products) {
      const productEntity = await this.productRepository.findOne({
        where: { id: product.product_id },
        relations: ['taxes', 'shop.address'],
      });

      if (!productEntity || productEntity.quantity < product.quantity) {
        unavailable_products.push(product.product_id);
      } else {
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

  private async updateOrderStatusInDatabase(id: number, updateOrderStatusInput: UpdateOrderStatusDto): Promise<OrderStatus> {
    const orderStatus = await this.findOrderStatusInDatabase(id);
    if (!orderStatus) {
      throw new NotFoundException('Order status not found');
    }
    Object.assign(orderStatus, updateOrderStatusInput);
    return await this.orderStatusRepository.save(orderStatus);
  }

  async createOrderStatus(createOrderStatusInput: CreateOrderStatusDto): Promise<OrderStatus> {
    const orderStatus = this.orderStatusRepository.create(createOrderStatusInput);
    return await this.orderStatusRepository.save(orderStatus);
  }

  async updateOrderStatus(id: number, updateOrderStatusInput: UpdateOrderStatusDto): Promise<OrderStatus> {
    try {
      const updatedOrderStatus = await this.updateOrderStatusInDatabase(id, updateOrderStatusInput);

      if (!updatedOrderStatus) {
        throw new NotFoundException('Order status not found or not updated');
      }
      return updatedOrderStatus;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getOrderFileItems({ page, limit }: GetOrderFilesDto): Promise<any> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return []
  }

  async getOrderFiles(getOrderFilesDto: GetOrderFilesDto): Promise<any> {
    const { order_id } = getOrderFilesDto;

    if (!order_id) {
      throw new BadRequestException('Order ID is required');
    }

    try {
      const orderFiles = await this.orderFilesRepository.find({
        where: { order_id },
        relations: ['file', 'fileable'],
      });

      if (!orderFiles.length) {
        throw new NotFoundException('No files found for the given order ID');
      }

      return orderFiles;
    } catch (error) {
      console.error('Error retrieving order files:', error);
      throw new InternalServerErrorException('Failed to retrieve order files');
    }
  }

  async getDigitalFileDownloadUrl(digitalFileId: number): Promise<string> {
    const item = await this.orderFilesRepository.findOne({
      where: { digital_file_id: digitalFileId },
    });

    if (!item) {
      throw new NotFoundException(`Digital file with ID ${digitalFileId} not found`);
    }

    return item.file.url;
  }

  async exportOrder(shop_id: string): Promise<any[]> {
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
          const pivot = product.pivot.find(p => p.product.id === product.id); // Adjust this based on your actual setup
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
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw new InternalServerErrorException('Failed to export orders');
    }
  }

  async downloadInvoiceUrl(orderId: string): Promise<void> {
    const invoice = await this.orderRepository.findOne({
      where: { id: +orderId },
      relations: ['products', 'billing_address', 'shipping_address', 'customer', 'dealer', 'soldByUserAddress', 'products.shop', 'products.taxes', 'products.pivot'],
    });

    if (!invoice) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const hashtabel: Record<string, any[]> = {};

    for (const product of invoice.products) {
      if (!hashtabel[product.shop_id]) {
        hashtabel[product.shop_id] = [product];
      } else {
        hashtabel[product.shop_id].push(product);
      }
    }

    for (const shopId in hashtabel) {
      if (hashtabel.hasOwnProperty(shopId)) {
        const shopProducts = hashtabel[shopId];
        const taxType: any = {
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
          const stateCodeValue = stateCode[invoice.shipping_address.state];
          taxType.CGST = shopProducts[0].taxes.rate * shopProducts[0].pivot.order_quantity / 2;
          taxType.SGST = shopProducts[0].taxes.rate * shopProducts[0].pivot.order_quantity / 2;
          taxType.state_code = stateCodeValue;
        } else {
          const stateCodeValue = stateCode[invoice.shipping_address.state];
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

  processChildrenOrder(order: Order): Order[] {
    if (order.children && Array.isArray(order.children)) {
      return order.children.map(child => ({
        ...child,
        order_status: order.order_status,
        payment_status: order.payment_status,
      }));
    }
    return [];
  }

  async processPaymentIntent(order: Order): Promise<PaymentIntent> {
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
    } catch (error) {
      console.error('Error processing payment intent:', error.message || error);
      throw new InternalServerErrorException('Failed to process payment intent');
    }
  }

  async savePaymentIntent(order: Order): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: order.customer.id },
        relations: ['permission'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${order.customer.id} not found`);
      }

      const authUser = this.authService.me(user.email, user.id);

      switch (order.payment_gateway) {
        case PaymentGatewayType.STRIPE:
          const stripeParams = await this.stripeService.makePaymentIntentParam(order, await authUser);
          return this.stripeService.createPaymentIntent(stripeParams);
        case PaymentGatewayType.PAYPAL:
          return this.paypalService.createPaymentIntent(order);
        case PaymentGatewayType.RAZORPAY:
          return this.razorpayService.createPaymentIntent(order);
        default:
          throw new BadRequestException('Unsupported payment gateway');
      }
    } catch (error) {
      console.error('Error saving payment intent:', error.message || error);
      throw new InternalServerErrorException('Failed to save payment intent');
    }
  }

  async stripePay(order: Order): Promise<void> {
    try {
      order.order_status = OrderStatusType.PROCESSING;
      order.payment_status = PaymentStatusType.SUCCESS;
      order.payment_intent = null;
      await this.orderRepository.save(order);
    } catch (error) {
      console.error('Error processing Stripe payment:', error.message || error);
      throw new InternalServerErrorException('Failed to process Stripe payment');
    }
  }

  async paypalPay(order: Order): Promise<void> {
    try {
      const response = await this.paypalService.verifyOrder(order.payment_intent.payment_intent_info.order_id);

      if (response.status === 'COMPLETED') {
        order.payment_status = PaymentStatusType.SUCCESS;
      } else {
        order.payment_status = PaymentStatusType.FAILED;
      }

      order.order_status = OrderStatusType.PROCESSING;
      await this.orderRepository.save(order);
    } catch (error) {
      console.error('Failed to process PayPal payment:', error.message || error);
      order.order_status = OrderStatusType.FAILED;
      await this.orderRepository.save(order);
    }
  }

  async razorpayPay(order: Order, paymentIntentInfo: PaymentIntentInfo): Promise<boolean> {
    if (!order || !paymentIntentInfo || !paymentIntentInfo.payment_id) {
      throw new BadRequestException('Order or payment intent information is missing.');
    }

    try {
      // Verify the payment intent with Razorpay
      const response = await this.razorpayService.verifyOrder(paymentIntentInfo.payment_id);

      // Check if the payment status is 'captured'
      if (response.payment.status === 'captured') {
        // Update the order status to 'COMPLETED' and payment status to 'PAID'
        order.payment_status = PaymentStatusType.PAID;
        order.order_status = OrderStatusType.COMPLETED;

        // Save the updated order
        await this.orderRepository.save(order);

        // Optionally, handle other post-payment logic here (e.g., send confirmation email)
        await this.sendOrderConfirmation(order);

        return true;
      } else {
        // Handle cases where payment status is not 'captured'
        console.warn(`Payment status is not captured. Status: ${response.payment.status}`);
        return false;
      }
    } catch (error) {
      console.error('Failed to process Razorpay payment:', error.message || error);
      throw new InternalServerErrorException('Failed to process Razorpay payment');
    }
  }

  // Optional method to send order confirmation email
  private async sendOrderConfirmation(order: Order): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id: order.customer_id || order.customerId } })
      await this.mailService.sendOrderConfirmation(order, user);
    } catch (error) {
      console.error('Failed to send order confirmation email:', error.message || error);
      // Optionally handle failure in sending email (e.g., log or notify admin)
    }
  }


  async changeOrderPaymentStatus(order: Order, paymentStatus: PaymentStatusType): Promise<void> {
    try {
      order.payment_status = paymentStatus;
      await this.orderRepository.save(order);
    } catch (error) {
      console.error('Failed to change order payment status:', error.message || error);
      throw new InternalServerErrorException('Failed to change order payment status');
    }
  }
}
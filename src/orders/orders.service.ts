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
import { UserAddress } from '../addresses/entities/address.entity';

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
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>,
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
    const order = new Order();
    const paymentGatewayType = createOrderInput.payment_gateway || PaymentGatewayType.CASH_ON_DELIVERY;

    try {
      // Handle customer or guest orders
      if (createOrderInput.customerId) {
        const customer = await this.userRepository.findOne({ where: { id: createOrderInput.customerId }, relations: ['type'] });
        if (!customer) throw new NotFoundException('Customer not found');
        order.customer = customer;
        order.customer_id = customer.id; // Ensure customer_id is set
      } else if (createOrderInput.customer_contact) {
        order.customer_contact = createOrderInput.customer_contact;
      } else {
        throw new BadRequestException('Customer ID or contact information is required');
      }

      // Ensure billing address exists or create it
      let billingAddress = await this.userAddressRepository.findOne({ where: { id: createOrderInput.billing_address.id } });
      if (!billingAddress) {
        billingAddress = this.userAddressRepository.create(createOrderInput.billing_address);
        await this.userAddressRepository.save(billingAddress);
      }
      order.billing_address = billingAddress;

      // Ensure shipping address exists or create it
      let shippingAddress = await this.userAddressRepository.findOne({ where: { id: createOrderInput.shipping_address.id } });
      if (!shippingAddress) {
        shippingAddress = this.userAddressRepository.create(createOrderInput.shipping_address);
        await this.userAddressRepository.save(shippingAddress);
      }
      order.shipping_address = shippingAddress;

      // Assign general order fields
      order.payment_gateway = paymentGatewayType;
      order.total = createOrderInput.total || 0;
      order.amount = createOrderInput.amount;
      order.sales_tax = createOrderInput.sales_tax;
      order.paid_total = createOrderInput.paid_total || 0;
      order.discount = createOrderInput.discount || 0;
      order.delivery_fee = createOrderInput.delivery_fee || 0;
      order.delivery_time = createOrderInput.delivery_time;

      // Handle dealer, shop, and soldByUserAddress
      if (createOrderInput.dealerId) {
        const dealer = await this.userRepository.findOne({ where: { id: createOrderInput.dealerId } });
        if (!dealer) throw new NotFoundException('Dealer not found');
        order.dealer = dealer;
      }

      if (createOrderInput.shop_id) {
        const shop = await this.shopRepository.findOne({ where: { id: createOrderInput.shop_id } });
        if (!shop) throw new NotFoundException('Shop not found');
        order.shop = shop;
      }

      if (createOrderInput.soldByUserAddress?.id) {
        const soldByUserAddress = await this.userAddressRepository.findOne({ where: { id: createOrderInput.soldByUserAddress.id } });
        if (!soldByUserAddress) throw new NotFoundException('SoldByUserAddress not found');
        order.soldByUserAddress = soldByUserAddress;
      }

      // Set order status and payment status
      await this.setOrderStatus(order, paymentGatewayType);

      // Validate and process products
      if (!createOrderInput.products || createOrderInput.products.some(product => !product.product_id)) {
        throw new BadRequestException('Invalid order products');
      }

      const productEntities = await this.productRepository.find({
        where: { id: In(createOrderInput.products.map(product => product.product_id)) },
      });

      if (productEntities.length !== createOrderInput.products.length) {
        throw new NotFoundException('Some products not found for this order');
      }

      // Apply coupon if provided
      if (createOrderInput.coupon_id) {
        await this.applyCoupon(createOrderInput.coupon_id, order);
      }

      // Create invoice number
      const invoice = `OD${Math.floor(Math.random() * Date.now())}`;
      const orderData = this.createOrderData(createOrderInput, productEntities, invoice);

      // Call external service for order creation
      const shiprocketResponse = await this.shiprocketService.createOrder(orderData);
      if (!shiprocketResponse.shipment_id && !shiprocketResponse.order_id) {
        throw new InternalServerErrorException('Failed to create order in Shiprocket');
      }

      order.tracking_number = shiprocketResponse.shipment_id || shiprocketResponse.order_id;
      order.logistics_provider = shiprocketResponse.courier_name || 'Unknown';

      // Save order to the database
      const savedOrder = await this.orderRepository.save(order);

      // Process payment if applicable
      if ([PaymentGatewayType.STRIPE, PaymentGatewayType.PAYPAL, PaymentGatewayType.RAZORPAY].includes(paymentGatewayType)) {
        const paymentIntent = await this.processPaymentIntent(order);
        order.payment_intent = paymentIntent;
      }

      // Handle order products
      if (createOrderInput.products) {
        const productEntities = await this.productRepository.find({
          where: { id: In(createOrderInput.products.map(product => product.product_id)) },
        });
        for (const product of createOrderInput.products) {
          if (product) {
            const newPivot = new OrderProductPivot();
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
            } else {
              throw new NotFoundException('Product not found');
            }
          }
        }
        savedOrder.products = productEntities;
      }

      // Handle child orders
      savedOrder.children = this.processChildrenOrder(savedOrder);

      // Save order files if products have attachments
      if (createOrderInput.products && createOrderInput.products.some(product => product.product_id && product.variation_option_id)) {
        await this.createOrderFiles(savedOrder, productEntities);
      }

      // Download invoice URL if saved
      if (savedOrder?.id) {
        await this.downloadInvoiceUrl(savedOrder.id.toString());
      }

      // Create stocks if customer and dealer are the same
      if (savedOrder.customer && savedOrder.dealer && savedOrder.customer.id === savedOrder.dealer.id) {
        const createStocksDto = {
          user_id: savedOrder.customer.id,
          order_id: savedOrder.id,
          products: createOrderInput.products,
        };
        if (!createStocksDto.order_id) {
          throw new BadRequestException('Order ID is required');
        }
        await this.stocksService.create(createStocksDto);
      }

      // Send notification if customer is provided
      if (savedOrder.customer || savedOrder.customer_contact) {
        await this.notificationService.createNotification(
          Number(savedOrder.customer?.id) || parseInt(savedOrder.customer_contact),
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
      const orderFiles = await Promise.all(products.map(async (product) => {
        if (product.attachment_id && product.url) {
          const file = new File();
          file.attachment_id = product.attachment_id;
          file.url = product.url;
          file.fileable_id = product.id;

          const savedFile = await this.fileRepository.save(file);

          const orderFile = new OrderFiles();
          orderFile.purchase_key = `PK_${Math.random().toString(36).substr(2, 9)}`;
          orderFile.digital_file_id = savedFile.id;
          orderFile.order_id = order.id;
          orderFile.customer_id = order.customer_id;  // Ensure customer_id is set
          orderFile.file = savedFile;
          orderFile.fileable = product;

          return orderFile;
        }
      }));

      const validOrderFiles = orderFiles.filter((orderFile) => orderFile !== undefined);

      if (validOrderFiles.length > 0) {
        await this.orderFilesRepository.save(validOrderFiles);
      }
    } catch (error) {
      console.error('Error creating order files:', error);
      throw new InternalServerErrorException('Failed to create order files');
    }
  }


  private async setOrderStatus(order: Order, paymentGatewayType: PaymentGatewayType) {
    let statusSlug: string;
    let paymentStatus: PaymentStatusType;

    switch (paymentGatewayType) {
      case PaymentGatewayType.CASH_ON_DELIVERY:
      case PaymentGatewayType.CASH:
        order.order_status = OrderStatusType.PROCESSING;
        order.payment_status = paymentGatewayType === PaymentGatewayType.CASH_ON_DELIVERY
          ? PaymentStatusType.CASH_ON_DELIVERY
          : PaymentStatusType.CASH;
        statusSlug = OrderStatusType.PROCESSING;
        break;
      case PaymentGatewayType.FULL_WALLET_PAYMENT:
        order.order_status = OrderStatusType.COMPLETED;
        order.payment_status = PaymentStatusType.WALLET;
        statusSlug = OrderStatusType.COMPLETED;
        break;
      default:
        order.order_status = OrderStatusType.PENDING;
        order.payment_status = PaymentStatusType.PENDING;
        statusSlug = OrderStatusType.PENDING;
        break;
    }

    let status = await this.orderStatusRepository.findOne({ where: { slug: statusSlug } });
    if (!status) {
      status = this.orderStatusRepository.create({
        name: statusSlug,
        slug: statusSlug,
        color: '#000',  // Default color
        serial: 1,      // Default serial
        language: 'en', // Default language
        translated_languages: [],
      });
      await this.orderStatusRepository.save(status);
    }

    order.status = status;
  }


  private async applyCoupon(couponId: number, order: Order): Promise<void> {
    const coupon = await this.couponRepository.findOne({ where: { id: couponId } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (!coupon.is_valid || new Date(coupon.expire_at) < new Date()) {
      throw new BadRequestException('Coupon is invalid or expired');
    }

    if (order.total < coupon.minimum_cart_amount) {
      throw new BadRequestException('Order total does not meet the minimum amount required for the coupon');
    }

    order.total -= coupon.amount;
    order.coupon = coupon;
  }

  private createOrderData(createOrderInput, productEntities: Product[], invoice: string) {
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
      billing_email: createOrderInput.customer?.email || '',
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
      shipping_email: createOrderInput.customer?.email || '',
      shipping_phone: createOrderInput.customer_contact || '',
      order_items: productEntities.map((product, index) => ({
        name: product.name || '',
        sku: product.sku || Math.random().toString(),
        units: createOrderInput.products[index]?.order_quantity || 1,
        selling_price: product.sale_price || 0,
        unit_price: createOrderInput.products[index]?.unit_price || 0,
        subtotal: createOrderInput.products[index]?.subtotal || 0,
        discount: product.discount || 0,
        tax: product.tax || 0,
        hsn: product.hsn || '',
        is_gst: product.is_gst || false,
        gst: product.gst || 0,
        original_price: product.original_price || 0,
      })),
      payment_method: createOrderInput.payment_gateway,
      shipping_charges: createOrderInput.delivery_fee || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: createOrderInput.discount || 0,
      sub_total: createOrderInput.total,
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
      const user = await this.userRepository.findOne({ where: { id: order.customer_id || order.customer.id } })
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
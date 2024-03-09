/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import exportOrderJson from '@db/order-export.json';
import orderFilesJson from '@db/order-files.json';
import orderInvoiceJson from '@db/order-invoice.json';
import setting from '@db/settings.json';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { GetOrderFilesDto, OrderFilesPaginator } from './dto/get-downloads.dto';
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
import { In, Repository, UpdateResult, getManager } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { OrderProductPivot, Product } from 'src/products/entities/product.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { RazorpayService } from 'src/payment/razorpay-payment.service';
import { ShiprocketService } from 'src/orders/shiprocket.service';
import { stateCode } from 'src/taxes/state_code.tax';
import { Shop } from 'src/shops/entities/shop.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { throwError } from 'rxjs';
import { rejects, throws } from 'assert';
import { error } from 'console';
import { MailService } from 'src/mail/mail.service';
import { Dealer } from 'src/users/entities/dealer.entity';
import { UserAddress } from 'src/addresses/entities/address.entity';

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
    private readonly shiprocketService: ShiprocketService,
    private readonly MailService: MailService,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Dealer)
    private readonly dealerRepository: Repository<Dealer>,
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
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) { }

  async updateOrdQuantityProd(ordProducts: any[]): Promise<void> {
    const entityManager = this.productRepository.manager;
    try {
      if (!ordProducts || ordProducts.length === 0) {
        throw new BadRequestException('Invalid input. No products provided.');
      }

      const productIds = ordProducts.map(product => product.product_id);
      const productEntities = await this.productRepository.find({ where: { id: In(productIds) } });

      if (productEntities.length === 0) {
        throw new NotFoundException('Products not found');
      }

      for (const ordProduct of ordProducts) {
        const productEntity = productEntities.find(entity => entity.id === ordProduct.product_id);

        if (productEntity) {
          // Validate that the order quantity does not exceed the available quantity
          if (ordProduct.order_quantity > productEntity.quantity) {
            throw new BadRequestException(`Order quantity exceeds available quantity for product ID ${productEntity.id}`);
          }

          // Update the product quantity by subtracting the order quantity
          productEntity.quantity -= ordProduct.order_quantity;

          // Save the updated product
          await entityManager.save(productEntity);
        }
      }

      console.log('Product quantities updated successfully');
    } catch (error) {
      console.error('Error updating product quantities:', error.message || error);
      throw error;
    }
  }

  async create(createOrderInput: CreateOrderDto): Promise<Order> {
    try {
      console.log("createOrderInput***", createOrderInput)
      // throw error
      const order = plainToClass(Order, createOrderInput)
      const newOrderStatus = new OrderStatus();
      const newOrderFile = new OrderFiles();
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
        newOrderFile.customer_id = customer.id;
      }

      const Invoice = "OD" + Math.floor(Math.random() * Date.now());

      if (!order.products || order.products.some(product => product.product_id === undefined)) {
        throw new Error('Invalid order.products');
      }

      const productEntities = await Promise.all(
        order.products
          .map(product => product.product_id)
          .filter(product_id => product_id !== undefined)
          .map(product_id => this.productRepository.findOne({ where: { id: product_id } }))
      );

      const orderData = {
        order_id: Invoice,
        order_date: new Date().toISOString(),
        pickup_location: "Primary",
        channel_id: "",
        comment: "",
        billing_customer_name: order.billing_address.name ? order.billing_address.name : "John",
        billing_last_name: order.billing_address.lastName ? order.billing_address.lastName : "Doe",
        billing_address: order.billing_address.street_address,
        billing_address_2: order.billing_address.ShippingAddress ? order.billing_address.ShippingAddress : "indore",
        billing_city: order.billing_address.city,
        billing_pincode: order.billing_address.zip,
        billing_state: order.billing_address.state,
        billing_country: order.billing_address.country,
        billing_email: order.customer?.email,
        billing_phone: order.customer_contact,
        shipping_is_billing: true,
        shipping_customer_name: order.shipping_address.name ? order.shipping_address.name : "John",
        shipping_last_name: order.shipping_address.lastName ? order.shipping_address.lastName : "Doe",
        shipping_address: order.shipping_address.street_address,
        shipping_address_2: order.shipping_address.ShippingAddress ? order.shipping_address.ShippingAddress : "indore",
        shipping_city: order.shipping_address.city,
        shipping_pincode: order.shipping_address.zip,
        shipping_country: order.shipping_address.country,
        shipping_state: order.shipping_address.state,
        shipping_email: order.customer?.email,
        shipping_phone: order.customer_contact,
        order_items: productEntities.map((product: Product, index: number) => ({
          name: product.name,
          sku: product.sku ? product.sku : Math.random(),
          units: order.products[index].order_quantity,
          selling_price: product.sale_price,
          unit_price: order.products[index].unit_price,
          subtotal: order.products[index].subtotal,
          discount: product.discount ? product.discount : 0,
          tax: product.tax ? product.tax : 0,
          hsn: product.hsn ? product.hsn : 0
        })),
        payment_method: order.payment_gateway,
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: order.total,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 1
      };

      const shiprocketResponse = await this.shiprocketService.createOrder(orderData);

      order.tracking_number = shiprocketResponse.shipment_id || shiprocketResponse.order_id;

      await this.orderRepository.save(order);

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
              newPivot.order = order;
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

      if ([PaymentGatewayType.STRIPE, PaymentGatewayType.PAYPAL, PaymentGatewayType.RAZORPAY].includes(paymentGatewayType)) {
        const paymentIntent = await this.processPaymentIntent(order);
        order.payment_intent = paymentIntent;
      }

      const createdOrderStatus = await this.orderStatusRepository.save(newOrderStatus);
      order.status = createdOrderStatus;
      order.children = this.processChildrenOrder(order);

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

      const savedOrder = await this.orderRepository.save(order);
      newOrderFile.order_id = savedOrder.id;
      await this.orderFilesRepository.save(newOrderFile);

      if (savedOrder?.id) {
        await this.downloadInvoiceUrl((savedOrder.id).toString())
      }

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
      const usr = await this.userRepository.findOne({ where: { id: customer_id }, relations: ['type'] });

      if (!usr) {
        throw new Error('User not found');
      }

      // Fetch permissions for the user
      const permsn = await this.permissionRepository.findOneBy(usr.type);

      let query = this.orderRepository.createQueryBuilder('order');
      query = query.leftJoinAndSelect('order.status', 'status');
      query = query.leftJoinAndSelect('order.dealer', 'dealer');
      query = query.leftJoinAndSelect('order.billing_address', 'billing_address');
      query = query.leftJoinAndSelect('order.shipping_address', 'shipping_address');
      query = query.leftJoinAndSelect('order.customer', 'customer');
      query = query.leftJoinAndSelect('order.products', 'products')
        .leftJoinAndSelect('products.pivot', 'pivot')
        .leftJoinAndSelect('products.taxes', 'taxes')
        .leftJoinAndSelect('products.variation_options', 'variation_options');
      query = query.leftJoinAndSelect('order.payment_intent', 'payment_intent')
        .leftJoinAndSelect('payment_intent.payment_intent_info', 'payment_intent_info');
      query = query.leftJoinAndSelect('order.shop_id', 'shop');
      query = query.leftJoinAndSelect('order.coupon', 'coupon');

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
            children: order.children,
            wallet_point: order?.wallet_point
          };
        })
      );

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
        .leftJoinAndSelect('order.shop_id', 'shop')
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

  async getOrderByIdOrTrackingNumber(id: number): Promise<any> {
    try {

      const order = await this.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.status', 'status')
        .leftJoinAndSelect('order.dealer', 'dealer')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.products', 'products')
        .leftJoinAndSelect('order.saleBy', 'saleBy')
        .leftJoinAndSelect('products.pivot', 'pivot')
        .leftJoinAndSelect('products.taxes', 'product_taxes')
        .leftJoinAndSelect('products.shop', 'product_shop')
        .leftJoinAndSelect('product_shop.address', 'shop_address')
        .leftJoinAndSelect('order.payment_intent', 'payment_intent')
        .leftJoinAndSelect('payment_intent.payment_intent_info', 'payment_intent_info')
        .leftJoinAndSelect('order.shop_id', 'order_shop')
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
        coupon_id: order.coupon,
        parent_id: order.parentOrder,
        saleBy: order.saleBy,
        shop: order.shop_id,
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
        products: await Promise.all(order.products.map(async (product) => {
          const pivot = product.pivot.find(p => p.Ord_Id === order.id);

          if (!pivot || !product.id) {  // Ensure product.id is defined
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
        children: order.children,
        wallet_point: order.wallet_point
      };
      console.log("transformedOrder****", transformedOrder)
      return transformedOrder;
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
        .leftJoinAndSelect('order.shop_id', 'shop')
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
      orderToDelete.shop_id = null;
      orderToDelete.saleBy = null;
      orderToDelete.billing_address = null;
      orderToDelete.shipping_address = null;
      orderToDelete.parentOrder = null;
      orderToDelete.children = null;
      orderToDelete.coupon = null;

      // Save the updated order to the database
      await this.orderRepository.save(orderToDelete);

      // Remove the order from the database
      await this.orderRepository.remove(orderToDelete);
      // await this.MailService.sendCancelOrder(orderToDelete)
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
      .leftJoinAndSelect('order.shop_id', 'shop')
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
      const productEntity = await this.productRepository.findOne({ where: { id: product.product_id }, relations: ['shop.address'] });

      // Check if the product is available
      if (!productEntity || productEntity.stock < product.quantity) {
        unavailable_products.push(product.product_id);
      } else {
        // Calculate the total tax and shipping charge
        total_tax += product.subtotal * productEntity.taxes.rate / 100  //IGST
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


  async getOrderFileItems({ page, limit }: GetOrderFilesDto): Promise<OrderFilesPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = orderFiles.slice(startIndex, endIndex);

    const url = `/downloads?&limit=${limit}`;

    // Assuming your paginate function is properly implemented
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

  async downloadInvoiceUrl(Order_id: string) {

    const Invoice = await this.getOrderByIdOrTrackingNumber(parseInt(Order_id));
    console.log("Invoice****", Invoice);

    // throw error
    const hashtabel: Record<string, any[]> = {};

    for (let product of Invoice.products) {
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
          billing_address: Invoice.billing_address,
          shipping_address: Invoice.shipping_address,
          created_at: Invoice.created_at,
          order_no: Invoice.id,
          invoice_date: Invoice.created_at,
          shop_address: shopProducts[0].shop,
          products: shopProducts,
        };

        // Assuming all products in a shop have the same tax rates and state information
        if (shopProducts[0].shop.address.state === Invoice.shipping_address.state) {
          const stateCodeValue = stateCode[Invoice.shipping_address.state];
          taxType.CGST = shopProducts[0].taxes.rate * shopProducts[0].pivot.order_quantity / 2;
          taxType.SGST = shopProducts[0].taxes.rate * shopProducts[0].pivot.order_quantity / 2;
          taxType.state_code = stateCodeValue;
        } else {
          const stateCodeValue = stateCode[Invoice.shipping_address.state];
          taxType.IGST = shopProducts[0].taxes.rate * shopProducts[0].pivot.order_quantity;
          taxType.state_code = stateCodeValue;
        }

        await this.MailService.sendInvoiceToCustomer(taxType);
      }
    }
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
    const usr = await this.userRepository.findOne({ where: { id: order.customer.id }, relations: ['type'] });
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

    order.order_status = OrderStatusType.PROCESSING;
    try {
      const response = await this.paypalService.verifyOrder(order.payment_intent.payment_intent_info.order_id);

      if (response.status === 'COMPLETED') {

        order.payment_status = PaymentStatusType.SUCCESS;
        order.payment_intent = null;
      } else {

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


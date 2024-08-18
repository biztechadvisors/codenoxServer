import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderFilesDto, OrderFilesPaginator } from './dto/get-downloads.dto';
import { GetOrderStatusesDto } from './dto/get-order-statuses.dto';
import { GetOrdersDto, OrderPaginator } from './dto/get-orders.dto';
import { OrderPaymentDto } from './dto/order-payment.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CheckoutVerificationDto } from './dto/verify-checkout.dto';
import { Order, PaymentGatewayType, PaymentStatusType } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { ShiprocketService } from './shiprocket.service';
import { StocksService } from 'src/stocks/stocks.service';
import { Logger } from '@nestjs/common';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService,
  ) { }

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order | { statusCode: number; message: string }> {
    try {
      const OrdSuccess = await this.ordersService.create(createOrderDto);
      await this.ordersService.updateOrderQuantityProducts(createOrderDto.products);
      return OrdSuccess;
    } catch (error) {
      this.logger.error('Error creating order:', error.message || error);
      throw new BadRequestException('Failed to create order');
    }
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async getOrders(@Query() query: GetOrdersDto): Promise<OrderPaginator> {
    return this.ordersService.getOrders(query);
  }

  @Get(':id')
  async getOrderById(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.getOrderByIdOrTrackingNumber(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  @Get('tracking-number/:tracking_id')
  async getOrderByTrackingNumber(@Param('tracking_id', ParseIntPipe) tracking_id: number) {
    const order = await this.ordersService.getOrderByIdOrTrackingNumber(tracking_id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }

  @Post('checkout/verify')
  @UsePipes(new ValidationPipe())
  async verifyCheckout(@Body() body: CheckoutVerificationDto) {
    return this.ordersService.verifyCheckout(body);
  }

  @Post('/payment')
  @HttpCode(200)
  @UsePipes(new ValidationPipe())
  async submitPayment(@Body() orderPaymentDto: OrderPaymentDto): Promise<void> {
    const { tracking_number, paymentIntentInfo } = orderPaymentDto;
    const order = await this.ordersService.getOrderByIdOrTrackingNumber(tracking_number);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    switch (order.payment_gateway.toString().toLowerCase()) {
      case 'stripe':
        await this.ordersService.stripePay(order);
        break;
      case 'paypal':
        await this.ordersService.paypalPay(order);
        break;
      case 'razorpay':
        const paymentSuccessful = await this.ordersService.razorpayPay(order, paymentIntentInfo);
        if (paymentSuccessful) {
          await this.ordersService.changeOrderPaymentStatus(order, PaymentStatusType.SUCCESS);
        }
        break;
      default:
        throw new BadRequestException('Invalid payment gateway');
    }
  }
}

@Controller('order-status')
export class OrderStatusController {
  private readonly logger = new Logger(OrderStatusController.name);

  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createOrderStatusDto: CreateOrderStatusDto) {
    return this.ordersService.createOrderStatus(createOrderStatusDto);
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(@Query() query: GetOrderStatusesDto) {
    return this.ordersService.getOrderStatuses(query);
  }

  @Get(':param')
  async findOne(@Param('param') param: string, @Query('language') language: string) {
    return this.ordersService.getOrderStatus(param, language);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}

@Controller('downloads')
export class OrderFilesController {
  constructor(private ordersService: OrdersService) { }

  @Get()
  @UsePipes(new ValidationPipe())
  async getOrderFileItems(
    @Query() query: GetOrderFilesDto,
  ): Promise<OrderFilesPaginator> {
    return this.ordersService.getOrderFileItems(query);
  }

  @Post('digital_file')
  @UsePipes(new ValidationPipe())
  async getDigitalFileDownloadUrl(
    @Body('digital_file_id', ParseIntPipe) digitalFileId: number,
  ) {
    return this.ordersService.getDigitalFileDownloadUrl(digitalFileId);
  }
}

@Controller('export-order-url')
export class OrderExportController {
  private readonly logger = new Logger(OrderExportController.name);

  constructor(private ordersService: OrdersService) { }

  @Get()
  @UsePipes(new ValidationPipe())
  async orderExport(@Query('shop_id') shop_id: string) {
    return this.ordersService.exportOrder(shop_id);
  }
}

@Controller('download-invoice-url')
export class DownloadInvoiceController {
  private readonly logger = new Logger(DownloadInvoiceController.name);

  constructor(private ordersService: OrdersService) { }

  @Post()
  @UsePipes(new ValidationPipe())
  async downloadInvoiceUrl(@Body() input: { order_id: string }) {
    return this.ordersService.downloadInvoiceUrl(input.order_id);
  }
}

@Controller('Shiprocket_Service')
export class ShiprocketController {
  private readonly logger = new Logger(ShiprocketController.name);

  constructor(private readonly shiprocketService: ShiprocketService) { }

  @Get('delivery-charge')
  @UsePipes(new ValidationPipe())
  async deliveryCharge(@Query() requestBody: any) {
    try {
      const { pickup_postcode, delivery_postcode, weight, cod } = requestBody;
      const { partner, shippingDetails } = await this.shiprocketService.calculateShippingCostAndChoosePartner(
        pickup_postcode,
        delivery_postcode,
        weight,
        cod,
      );
      return {
        partner,
        shippingCost: shippingDetails.shippingCost,
        courierDetails: shippingDetails,
      };
    } catch (error) {
      this.logger.error('Error calculating shipping cost and choosing partner:', error.message);
      throw new BadRequestException('Failed to calculate shipping cost and choose a partner.');
    }
  }

  @Post('shipdelivery-charge')
  @UsePipes(new ValidationPipe())
  async deliveryChargeT(@Body() requestBody: any): Promise<any> {
    try {
      const response = await this.shiprocketService.calculateShippingCost(requestBody);
      return response;
    } catch (error) {
      this.logger.error('Error calculating shipping cost and choosing partner:', error.message);
      throw new BadRequestException('Failed to calculate shipping cost and choose a partner.');
    }
  }
}

/* eslint-disable prettier/prettier */
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
import { error } from 'console';
import { StocksService } from 'src/stocks/stocks.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) { }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order | { statusCode: number; message: string }> {
    try {
      // Attempt to create the order
      const OrdSuccess = await this.ordersService.create(createOrderDto);

      // Attempt to update product quantities
      await this.ordersService.updateOrdQuantityProd(createOrderDto.products);

      // If everything is successful, return the order success response
      return OrdSuccess;
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error creating order:', error.message || error);
    }
  }

  @Get()
  async getOrders(@Query() query: GetOrdersDto): Promise<OrderPaginator> {
    console.log('getOrders---55', query)
    return this.ordersService.getOrders(query);
  }

  @Get(':id')
  getOrderById(@Param('id') id: number) {
    return this.ordersService.getOrderByIdOrTrackingNumber(Number(id));
  }

  @Get('tracking-number/:tracking_id')
  getOrderByTrackingNumber(@Param('tracking_id') tracking_id: number) {
    return this.ordersService.getOrderByIdOrTrackingNumber(tracking_id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @Post('checkout/verify')
  verifyCheckout(@Body() body: CheckoutVerificationDto) { // Changed from @Query() to @Body()
    return this.ordersService.verifyCheckout(body);
  }

  @Post('/payment')
  @HttpCode(200)
  async submitPayment(@Body() orderPaymentDto: OrderPaymentDto): Promise<void> {
    const { tracking_number, paymentIntentInfo } = orderPaymentDto;
    const order: Order = await this.ordersService.getOrderByIdOrTrackingNumber(
      tracking_number,
    );
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
    // this.ordersService.processChildrenOrder(order);
  }
}

@Controller('order-status')
export class OrderStatusController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  create(@Body() createOrderStatusDto: CreateOrderStatusDto) {
    return this.ordersService.createOrderStatus(createOrderStatusDto);
  }

  @Get()
  findAll(@Query() query: GetOrderStatusesDto) {
    return this.ordersService.getOrderStatuses(query);
  }

  @Get(':param')
  findOne(@Param('param') param: string, @Query('language') language: string) {
    return this.ordersService.getOrderStatus(param, language);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}

@Controller('downloads')
export class OrderFilesController {
  constructor(private ordersService: OrdersService) { }

  @Get()
  async getOrderFileItems(
    @Query() query: GetOrderFilesDto,
  ): Promise<OrderFilesPaginator> {
    return this.ordersService.getOrderFileItems(query);
  }

  @Post('digital_file')
  async getDigitalFileDownloadUrl(
    @Body('digital_file_id', ParseIntPipe) digitalFileId: number,
  ) {
    return this.ordersService.getDigitalFileDownloadUrl(digitalFileId);
  }
}

@Controller('export-order-url')
export class OrderExportController {
  constructor(private ordersService: OrdersService) { }

  @Get()
  async orderExport(@Query('shop_id') shop_id: string) {
    return this.ordersService.exportOrder(shop_id);
  }
}

@Controller('download-invoice-url')
export class DownloadInvoiceController {
  constructor(private ordersService: OrdersService) { }

  @Post()
  async downloadInvoiceUrl(@Body() input: { order_id: string }) {
    const Invoice = this.ordersService.downloadInvoiceUrl(input.order_id);
    return Invoice
  }
}

@Controller('Shiprocket_Service')
export class ShiprocketController {
  constructor(private readonly shiprocketService: ShiprocketService) { }

  @Get('delivery-charge')
  async deliveryCharge(@Body() requestBody: any) {
    try {
      // Extract necessary parameters from the request body
      const { pickup_postcode, delivery_postcode, weight, cod } = requestBody;

      // Call the service method to calculate shipping cost and choose a partner
      const { partner, shippingDetails } = await this.shiprocketService.calculateShippingCostAndChoosePartner(
        pickup_postcode,
        delivery_postcode,
        weight,
        cod,
      );

      // Return the response with the relevant information
      return {
        partner,
        shippingCost: shippingDetails.shippingCost,
        courierDetails: {
          // Assuming that courierDetails is part of shippingDetails
          id: shippingDetails.courier_company_id,
          currency: shippingDetails.currency,
          city: shippingDetails.city,
          cod: shippingDetails.cod,
          courier_company_id: shippingDetails.courier_company_id,
          courier_name: shippingDetails.courier_name,
          min_weight: shippingDetails.min_weight,
          cod_charges: shippingDetails.cod_charges,
          postcode: shippingDetails.postcode,
          region: shippingDetails.region,
          state: shippingDetails.state,
          zone: shippingDetails.zone,
          shippingCost: shippingDetails.shippingCost,
          estimated_delivery_days: shippingDetails.estimated_delivery_days,
          estimated_date: shippingDetails.etd,
        },
      };
    } catch (error) {
      console.error('Error calculating shipping cost and choosing partner:', error);
      return { error: 'Failed to calculate shipping cost and choose a partner.' };
    }
  }
  // @Post('shipdelivery-charge')
  // async deliveryChargeT(@Body() requestBody: any): Promise<any> {
  //   try {
  //     console.log("requestBody", requestBody)
  //     const { pickup_postcode, delivery_postcode, weight, cod } = requestBody;
  //     const response = await this.shiprocketService.calculateShippingCost(pickup_postcode, delivery_postcode, weight, cod);
  //     return response;
  //   } catch (error) {
  //     console.error('Error calculating shipping cost and choosing partner:', error.message);
  //     return { error: 'Failed to calculate shipping cost and choose a partner.' };
  //   }
  // }
}
import { BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { Order } from 'src/orders/entities/order.entity';
import { AuthGuard } from 'src/auth/auth.guards';
import { AnalyticsResponseDTO } from './dto/analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Post()
  @UseGuards(AuthGuard)
  async getAnalytics(@Body() query: { customerId: number; state: string }): Promise<AnalyticsResponseDTO> {
    try {
      const result = await this.analyticsService.findAll(query.customerId, query.state);
      return result;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Error fetching analytics data');
    }
  }

  @Get()
  async getTopCustomers(@Query() query: { userId: string }) {
    try {
      const result = await this.analyticsService.getTopUsersWithMaxOrders(+query.userId); // Convert userId to a number if needed
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('topDealers')
  async getTopDealer(@Query() query: { userId: string }) {
    try {
      const result = await this.analyticsService.getTopDealer(+query.userId); // Convert userId to a number if needed
      return result;
    } catch (error) {
      throw error;
    }
  }

  // @Get('/calculate-orders')
  // // API Ex. : // http://localhost:5050/api/analytics/calculate-orders?startDate=2024-01-01&shop_id=9&customer_id=_&state=_&zip=_&dealer=_
  // async calculateOrderByODSC(@Query() filters: Record<string, any>): Promise<{ month: string; orderCount: number }[]> {
  //   const result = await this.analyticsService.calculateOrderByODSC(filters);
  //   return result;
  // }

}

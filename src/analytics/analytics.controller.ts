import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { Order } from 'src/orders/entities/order.entity';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get()
  async getAnalytics(@Query('customerId') customerId: number, @Query('state') state: string) {
    try {
      console.log("analytics", customerId, state);

      const result = await this.analyticsService.findAll(customerId, state);
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

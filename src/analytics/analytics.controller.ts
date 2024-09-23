import { BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Post, Query, Logger, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsResponseDTO, GetAnalyticsDto, TopUsersQueryDto } from './dto/analytics.dto';
import { ApiOperation } from '@nestjs/swagger';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { Analytics } from './entities/analytics.entity';

@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) { }

  @Post()
  @ApiOperation({ summary: 'Fetch analytics for a specific shop, customer, and state' })
  async getAnalytics(@Body() query: GetAnalyticsDto): Promise<AnalyticsResponseDTO> {
    try {
      this.logger.log(`Fetching analytics for shop_id: ${query.shop_id}, customerId: ${query.customerId}, state: ${query.state}`);

      const result = await this.analyticsService.findAll(query.shop_id, query.customerId, query.state);

      if ('message' in result) {
        // If the result has a message, it means an error occurred
        throw new BadRequestException(result.message);
      }

      if (!result) {
        throw new NotFoundException('No analytics data found');
      }

      return result; // Now we can safely return as AnalyticsResponseDTO
    } catch (error) {
      this.logger.error('Error fetching analytics:', error.message);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error; // Propagate specific HTTP exceptions
      }
      throw new BadRequestException('Error fetching analytics data');
    }
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Get top customers based on the number of orders' })
  async getTopCustomers(@Query() query: TopUsersQueryDto) {
    try {
      this.logger.log(`Fetching top customers for userId: ${query.userId}`);

      const result = await this.analyticsService.getTopUsersWithMaxOrders(+query.userId);

      if (!result || result.length === 0) {
        throw new NotFoundException('No top customers found');
      }

      return result;
    } catch (error) {
      this.logger.error('Error fetching top customers:', error.message);
      throw new BadRequestException('Error fetching top customers');
    }
  }

  @Get('top-dealers')
  @ApiOperation({ summary: 'Get top dealers' })
  async getTopDealer(@Query() query: TopUsersQueryDto) {
    try {
      this.logger.log(`Fetching top dealers for userId: ${query.userId}`);

      const result = await this.analyticsService.getTopDealer(+query.userId);

      if (!result || result.length === 0) {
        throw new NotFoundException('No top dealers found');
      }

      return result;
    } catch (error) {
      this.logger.error('Error fetching top dealers:', error.message);
      throw new BadRequestException('Error fetching top dealers');
    }
  }

  @Post('create')
  async createAnalytics(
    @Body() createAnalyticsDto: CreateAnalyticsDto
  ): Promise<AnalyticsResponseDTO> {
    const { analyticsData, saleData } = createAnalyticsDto;
    const analytics: Analytics = await this.analyticsService.createAnalyticsWithTotalYearSale(analyticsData, saleData);
    return this.mapToResponseDTO(analytics);
  }

  @Get(':id')
  async getAnalyticsById(@Param('id') id: number): Promise<AnalyticsResponseDTO> {
    const analytics: Analytics = await this.analyticsService.getAnalyticsById(id); // Ensure this method is defined in the service
    return this.mapToResponseDTO(analytics);
  }

  private mapToResponseDTO(analytics: Analytics): AnalyticsResponseDTO {
    return {
      totalRevenue: analytics.totalRevenue ?? 0,
      totalOrders: analytics.totalOrders ?? 0,
      totalRefunds: analytics.totalRefunds ?? 0,
      totalShops: analytics.totalShops ?? 0,
      todaysRevenue: analytics.todaysRevenue ?? 0,
      newCustomers: analytics.newCustomers ?? 0,
      totalYearSaleByMonth: analytics.totalYearSaleByMonth ?? [],
    };
  }
}

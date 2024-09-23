import { AnalyticsService } from './analytics.service';
import { AnalyticsResponseDTO, GetAnalyticsDto, TopUsersQueryDto } from './dto/analytics.dto';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly logger;
    constructor(analyticsService: AnalyticsService);
    getAnalytics(query: GetAnalyticsDto): Promise<AnalyticsResponseDTO>;
    getTopCustomers(query: TopUsersQueryDto): Promise<any[]>;
    getTopDealer(query: TopUsersQueryDto): Promise<any[]>;
    createAnalytics(createAnalyticsDto: CreateAnalyticsDto): Promise<AnalyticsResponseDTO>;
    getAnalyticsById(id: number): Promise<AnalyticsResponseDTO>;
    private mapToResponseDTO;
}

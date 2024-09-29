import { AnalyticsService } from './analytics.service';
import { AnalyticsResponseDTO, GetAnalyticsDto, TopUsersQueryDto } from './dto/analytics.dto';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { CacheService } from '../helpers/cacheService';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly cacheService;
    private readonly logger;
    constructor(analyticsService: AnalyticsService, cacheService: CacheService);
    getAnalytics(query: GetAnalyticsDto): Promise<AnalyticsResponseDTO>;
    getTopCustomers(query: TopUsersQueryDto): Promise<any[]>;
    getTopDealer(query: TopUsersQueryDto): Promise<any[]>;
    createAnalytics(createAnalyticsDto: CreateAnalyticsDto): Promise<AnalyticsResponseDTO>;
    getAnalyticsById(id: number): Promise<AnalyticsResponseDTO>;
    private mapToResponseDTO;
}

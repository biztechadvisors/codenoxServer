import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/reports.entity';
import { Cache } from 'cache-manager';
import { MyReportPaginator } from '../reports/dto/get-reports.dto';
import { CacheService } from '../helpers/cacheService';
export declare class AbusiveReportService {
    private readonly reportRepository;
    private readonly cacheManager;
    private readonly cacheService;
    constructor(reportRepository: Repository<Report>, cacheManager: Cache, cacheService: CacheService);
    findAllReports(shopSlug?: string, userId?: number, page?: number, limit?: number): Promise<MyReportPaginator>;
    findReport(id: number): Promise<Report>;
    create(createReportDto: CreateReportDto): Promise<Report>;
    update(id: number, updateReportDto: UpdateReportDto): Promise<Report>;
    delete(id: number): Promise<void>;
}

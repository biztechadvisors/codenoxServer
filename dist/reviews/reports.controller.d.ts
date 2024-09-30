import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AbusiveReportService } from './reports.service';
import { CacheService } from '../helpers/cacheService';
export declare class AbusiveReportsController {
    private reportService;
    private readonly cacheService;
    constructor(reportService: AbusiveReportService, cacheService: CacheService);
    findAll(shopSlug?: string, userId?: number, page?: number, limit?: number): Promise<import("../reports/dto/get-reports.dto").MyReportPaginator>;
    find(id: number): Promise<import("./entities/reports.entity").Report>;
    create(createReportDto: CreateReportDto): Promise<import("./entities/reports.entity").Report>;
    update(id: string, updateReportDto: UpdateReportDto): Promise<import("./entities/reports.entity").Report>;
    delete(id: string): Promise<void>;
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbusiveReportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reports_entity_1 = require("./entities/reports.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const paginate_1 = require("../common/pagination/paginate");
let AbusiveReportService = class AbusiveReportService {
    constructor(reportRepository, cacheManager) {
        this.reportRepository = reportRepository;
        this.cacheManager = cacheManager;
    }
    async findAllReports(shopSlug, userId, page = 1, limit = 10) {
        const cacheKey = `reports_${shopSlug || 'all'}_${userId || 'all'}_${page}_${limit}`;
        let reports = await this.cacheManager.get(cacheKey);
        if (!reports) {
            const query = this.reportRepository.createQueryBuilder('report');
            if (shopSlug) {
                query.innerJoinAndSelect('report.shop', 'shop', 'shop.slug = :slug', { slug: shopSlug });
            }
            if (userId) {
                query.innerJoinAndSelect('report.user', 'user', 'user.id = :id', { id: userId });
            }
            query.skip((page - 1) * limit).take(limit);
            reports = await query.getMany();
            await this.cacheManager.set(cacheKey, reports, 60);
        }
        const totalReports = await this.reportRepository.count();
        const url = `/reports?shopSlug=${shopSlug || ''}&userId=${userId || ''}&page=${page}&limit=${limit}`;
        return Object.assign({ data: reports }, (0, paginate_1.paginate)(totalReports, page, limit, reports.length, url));
    }
    async findReport(id) {
        return this.reportRepository.findOne({ where: { id } });
    }
    async create(createReportDto) {
        const report = this.reportRepository.create(createReportDto);
        return this.reportRepository.save(report);
    }
    async update(id, updateReportDto) {
        await this.reportRepository.update(id, updateReportDto);
        return this.reportRepository.findOne({ where: { id } });
    }
    async delete(id) {
        await this.reportRepository.delete(id);
    }
};
AbusiveReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reports_entity_1.Report)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], AbusiveReportService);
exports.AbusiveReportService = AbusiveReportService;
//# sourceMappingURL=reports.service.js.map
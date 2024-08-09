/* eslint-disable prettier/prettier */
// abusive-report.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/reports.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AbusiveReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

  ) { }

  async findAllReports(shopSlug?: string, userId?: number): Promise<Report[]> {
    const cacheKey = `reports_${shopSlug || 'all'}_${userId || 'all'}`;

    // Check if the data is in the cache
    let reports = await this.cacheManager.get<Report[]>(cacheKey);
    if (!reports) {
      // If not, fetch the data from the repository
      const query = this.reportRepository.createQueryBuilder('report');

      if (shopSlug) {
        query.innerJoinAndSelect('report.shop', 'shop', 'shop.slug = :slug', { slug: shopSlug });
      }

      if (userId) {
        query.innerJoinAndSelect('report.user', 'user', 'user.id = :id', { id: userId });
      }

      reports = await query.getMany();

      // Store the result in the cache
      await this.cacheManager.set(cacheKey, reports, 300); // Cache for 5 minutes
    }
    return reports;
  }

  async findReport(id: number): Promise<Report> {
    return this.reportRepository.findOne({ where: { id } });
  }

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create(createReportDto);
    return this.reportRepository.save(report);
  }

  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    await this.reportRepository.update(id, updateReportDto);
    return this.reportRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.reportRepository.delete(id);
  }
}
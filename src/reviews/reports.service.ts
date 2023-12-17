// abusive-report.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/reports.entity';

@Injectable()
export class AbusiveReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async findAllReports(): Promise<Report[]> {
    return this.reportRepository.find();
  }

  async findReport(id: number): Promise<Report> {
    return this.reportRepository.findOne({where:{id}});
  }

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create(createReportDto);
    return this.reportRepository.save(report);
  }

  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    await this.reportRepository.update(id, updateReportDto);
    return this.reportRepository.findOne({where:{id}});
  }

  async delete(id: number): Promise<void> {
    await this.reportRepository.delete(id);
  }
}

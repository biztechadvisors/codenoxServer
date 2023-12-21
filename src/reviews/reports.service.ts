<<<<<<< HEAD
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
=======
import { Injectable } from '@nestjs/common'
import { CreateReportDto } from './dto/create-report.dto'
import { UpdateReportDto } from './dto/update-report.dto'

@Injectable()
export class AbusiveReportService {
  findAllReports() {
    return 'this route returns all abusive report'
  }

  findReport(id: number) {
    return `This action returns a #${id} report`
  }

  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report'
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`
  }

  delete(id: number) {
    return `This action removes a #${id} report`
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
  }
}

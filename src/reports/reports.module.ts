import { Module } from '@nestjs/common'
import { ReportsController } from './reports.controller'
import { ReportsService } from './reports.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MyReports } from './entities/report.entity'

@Module({
  imports: [TypeOrmModule.forFeature([MyReports])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

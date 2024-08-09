/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { MyReports } from './entities/report.entity'

@Injectable()
export class ReportsService {

  findMyReports() {
    return {
    }
  }
}

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { UploadsService } from './uploads.service'
import { UploadsController } from './uploads.controller'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { AttachmentRepository } from 'src/common/common.repository'

@Module({
  imports: [TypeOrmExModule.forCustomRepository([AttachmentRepository])],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}

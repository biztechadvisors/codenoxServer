/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { UploadsService } from './uploads.service'
import { UploadsController } from './uploads.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Attachment } from '../common/entities/attachment.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Attachment])],
  controllers: [UploadsController],
  providers: [UploadsService],
})

export class UploadsModule { }


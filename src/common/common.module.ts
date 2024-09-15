/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { AttachmentRepository } from './common.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Attachment } from './entities/attachment.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment]),
  ],
  controllers: [],
  providers: [],
})
export class CommonModule { }

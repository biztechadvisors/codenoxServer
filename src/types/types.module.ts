import { Module } from '@nestjs/common';
import { TypesService } from './types.service';
import { TypesController } from './types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Type } from './entities/type.entity';
import { BannerRepoditory, TypeRepository, TypeSettingsRepository } from './types.repository';
import { AttachmentRepository } from 'src/common/common.repository';
import { UploadsService } from 'src/uploads/uploads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Type])],
  controllers: [TypesController],
  providers: [TypesService, AttachmentRepository, TypeRepository, TypeSettingsRepository, BannerRepoditory, UploadsService],
})

export class TypesModule { }

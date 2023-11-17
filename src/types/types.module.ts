import { Module } from '@nestjs/common';
import { TypesService } from './types.service';
import { TypesController } from './types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner, Type, TypeSettings } from './entities/type.entity';
import { BannerRepository, TypeRepository, TypeSettingsRepository } from './types.repository';
import { UploadsService } from 'src/uploads/uploads.service';
import { AttachmentRepository } from 'src/common/common.repository';
import { Attachment } from 'src/common/entities/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Type, TypeSettings, Banner, Attachment]), // Make sure to include TypeSettings and Banner in forFeature
  ],
  controllers: [TypesController],
  providers: [TypesService, UploadsService, TypeRepository, TypeSettingsRepository, BannerRepository, AttachmentRepository],
})
export class TypesModule {}

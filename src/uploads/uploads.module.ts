// uploads.module.ts
import { Module } from '@nestjs/common';
import { MulterExtendedModule } from 'nestjs-multer-extended';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { AttachmentRepository } from 'src/common/common.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmExModule.forCustomRepository([AttachmentRepository]),
    MulterExtendedModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        awsConfig: {
          accessKeyId: configService.get('AWS_ACCESS_KEY'),
          secretAccessKey: configService.get('AWS_SECRET_KEY'),
          region: configService.get('AWS_REGION'),
        },
        bucket: configService.get('AWS_BUCKET'), // Ensure this is correctly specified
        basePath: 'uploads',
        fileSize: 1 * 1024 * 1024, // Maximum file size (1 MB in this example)
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule { }

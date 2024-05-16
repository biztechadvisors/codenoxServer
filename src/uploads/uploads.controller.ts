import { Controller, Post, UseInterceptors, UploadedFiles, Get, Param, Delete, Req, Res, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { Attachment } from 'src/common/entities/attachment.entity';

@Controller('attachments')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor('attachment[]'),
  )
  async uploadFile(@UploadedFiles() attachments: Array<Express.Multer.File>) {
    if (!attachments || attachments.length === 0) {
      throw new BadRequestException('No attachments provided');
    }
    return await this.uploadsService.uploadFiles(attachments);
  }

  @Get()
  async findAll(): Promise<Attachment[]> {
    return this.uploadsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Attachment> {
    console.log('findOne**', id)
    return this.uploadsService.findOne(Number(id));
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.uploadsService.remove(Number(id));
  }
}

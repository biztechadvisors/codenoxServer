/* eslint-disable prettier/prettier */
import { Controller, Post, UseInterceptors, UploadedFiles, Get, Param, Delete } from '@nestjs/common';
import { AmazonS3FileInterceptor } from 'nestjs-multer-extended';
import { UploadsService } from './uploads.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from './edit-file-name.util';
import { Attachment } from 'src/common/entities/attachment.entity';

@Controller('attachments')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  @Post()
  @UseInterceptors(
    AmazonS3FileInterceptor('attachment[]'),
    FilesInterceptor('attachment[]', 20, {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
    }),
  )
  async uploadFile(@UploadedFiles() attachment: Array<Express.Multer.File>) {
    try {
      console.log('attachemetn*****', attachment)
      return await this.uploadsService.uploadFile(attachment);
    } catch (err) {
      console.log(err);
      throw new Error('Failed to upload file');
    }
  }

  @Get()
  async findAll(): Promise<Attachment[]> {
    return this.uploadsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Attachment> {
    return this.uploadsService.findOne(Number(id));
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.uploadsService.remove(Number(id));
  }
}
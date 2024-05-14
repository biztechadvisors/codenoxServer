import { Controller, Post, UseInterceptors, UploadedFiles, Get, Param, Delete, Req, Res } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { Attachment } from 'src/common/entities/attachment.entity';
import { diskStorage } from 'multer';
import { editFileName } from './edit-file-name.util';

@Controller('attachments')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor('attachment[]'
      //   , 10, {
      //   storage: diskStorage({
      //     destination: './uploads',
      //     filename: editFileName,
      //   }),
      // }
    ),
  )
  async uploadFile(@UploadedFiles() attachments: Array<Express.Multer.File>, @Req() request, @Res() response) {
    console.log(attachments, "**********************")
    try {
      const uploadedFiles = await this.uploadsService.uploadFiles(attachments);
      console.log("uploadedFiles ", uploadedFiles)
      return uploadedFiles.map(file => ({
        id: file.id,
        original: file.original,
        thumbnail: file.thumbnail,
      }));
    } catch (err) {
      console.log(err);
      return response.status(500).json({ error: 'Failed to upload files' });
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

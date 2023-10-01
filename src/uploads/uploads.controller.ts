import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { diskStorage } from 'multer';
import { editFileName } from './edit-file-name.util';

@Controller('attachments')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  // @Post()
  // @UseInterceptors(FilesInterceptor('attachment[]'))
  // uploadFile(@UploadedFiles() attachment: Array<Express.Multer.File>) {
  //   console.log(attachment);
  //   return [
  //     {
  //       id: '883',
  //       original:
  //         'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/aatik-tasneem-7omHUGhhmZ0-unsplash%402x.png',
  //       thumbnail:
  //         'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/conversions/aatik-tasneem-7omHUGhhmZ0-unsplash%402x-thumbnail.jpg',
  //     },
  //   ];
  // }


  @Post()
  @UseInterceptors(FilesInterceptor('attachment[]'))
  async uploadFile(@UploadedFiles() attachment: Array<Express.Multer.File>): Promise<AttachmentDTO> {
    console.log("Ram", attachment)
    return await this.uploadsService.uploadFile(attachment);
  }

  // @Post()
  // @UseInterceptors(FilesInterceptor('files', 20, {
  //   storage: diskStorage({
  //     destination: './uploads',
  //     filename: editFileName,
  //   }),
  // }))
  // async uploadMultipleFiles(@UploadedFiles() files) {
  //   const response = [];
  //   files.forEach(file => {
  //     const fileReponse = {
  //       filename: file.filename,
  //       serverFullPath: `http://localhost:3000/uploads/${file.filename}`,
  //     };
  //     response.push(fileReponse);
  //   });
  //   return response;
  // }

}

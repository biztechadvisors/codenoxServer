/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { UploadsService } from './uploads.service'
import { AttachmentDTO } from 'src/common/dto/attachment.dto'
import { diskStorage } from 'multer'
import { editFileName } from './edit-file-name.util'
import { UUID } from 'typeorm/driver/mongodb/bson.typings'

@Controller('attachments')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor('attachment[]', 20, {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
    }),
  )
  async uploadFile(@UploadedFiles() attachment: Array<Express.Multer.File>) {
    try {
      return await this.uploadsService.uploadFile(attachment)
    } catch (err) {
      console.log(err)
    }
    return [
      {
        id: new UUID(),
        original: attachment[0].filename,
        thumbnail: attachment[0].path,
      },
    ]
  }
}

/* eslint-disable prettier/prettier */
// import { Controller, Post, UseInterceptors, UploadedFiles, Delete } from '@nestjs/common';
// import { FilesInterceptor } from '@nestjs/platform-express';
// import { UploadsService } from './uploads.service';
// import { diskStorage } from 'multer';
// import { editFileName } from './edit-file-name.util';
// import { S3Client } from '@aws-sdk/client-s3'
// import multerS3 from 'multer-s3';
// import {put} from '@vercel/blob'

// const s3 = new S3Client({
//   credentials: {
//     accessKeyId: 'AKIA2FOXAF3Z6N2VQH4Z',
//     secretAccessKey: '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'
//   },
//   region: 'ap-south-1'
// })

// const fileFilter = (req:any, file:any, cb:any) => {
//   const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/svg', 'application/*'];
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid Mime Type, only JPEG, PNG, and SVG allowed'), false);
//   }
// };

// const upload = multerS3({
//   s3:s3,
//   bucket: 'codenoxtestbucket',
//   metadata: function (req, file, cb) {
//     cb(null, { fieldName: 'codenox_meta_data' });
//   },
//   key: function (req, file, cb) {
//     console.log(file)
//     // const uniqueFileName = editFileName(file.originalname);
//     cb(null, file.originalname);
//   },
// });

// @Controller('attachments')
// export class UploadsController {
//   constructor(private readonly uploadsService: UploadsService) {}
// // ==================VERCEL Image Upload====================

// @Post()
// // @UseInterceptors(FilesInterceptor('attachment[]', 20))
// // async uploadFile(@UploadedFiles() attachments: Array<Express.MulterS3.File>){
// //   try {
// //     console.log(attachments)

// //     const promises = attachments.map(async (attachment) => {
// //       console.log(attachment)
// //       const blob = await put(attachment.originalname, attachment.buffer, {
// //         access: 'public',
// //         token: 'vercel_blob_rw_GZUGnq0GlG2PdssA_lhSl5dgWWviNO5wemMhjIZpqRCKPo7'
// //       });
// //       // You can handle the result of each blob upload here if needed
// //       return blob;
// //     });

// //     const results = await Promise.all(promises);

// //     console.log(results)
// //   } catch (err) {
// //     console.error(err);
// //   }
// // }

// // }

// // ==================aws Image Upload====================
//   @Post()
//   @UseInterceptors(FilesInterceptor('attachment[]', 20, { storage: upload, fileFilter }))
//   async uploadFile(@UploadedFiles() attachments: Array<Express.MulterS3.File>) {
//     try {
//       // console.log(attachments)
//       // Your service logic for handling the uploaded files in AWS S3
//       return await this.uploadsService.uploadFile(attachments);
//     } catch (err) {
//       console.error(err);
//       // Handle error response if needed
//       return { error: 'Upload failed' };
//     }
//   }

// }


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
  constructor(private readonly uploadsService: UploadsService) {}


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
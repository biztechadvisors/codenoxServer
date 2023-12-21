/* eslint-disable prettier/prettier */
import { Injectable, UploadedFiles } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentRepository } from 'src/common/common.repository';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { Attachment } from 'src/common/entities/attachment.entity';

@Injectable()
export class UploadsService {

  constructor(
    @InjectRepository(AttachmentRepository) private attachmentRepository: AttachmentRepository,
  ) { }

  async uploadFile(attachment: Array<Express.Multer.File>): Promise<AttachmentDTO[]> {
    const attachmentData = [];
    for (const file of attachment) {
      const attachmentDTO = new AttachmentDTO();
      attachmentDTO.original = file.filename;
      attachmentDTO.thumbnail = file.path;
      attachmentData.push(attachmentDTO);
    }
    await this.attachmentRepository.save(attachmentData);
    console.log("AttachmentData", attachmentData)
    return attachmentData;
  }
// =====AWS CODE====================
  // async uploadFile(attachments: Array<Express.MulterS3.File>): Promise<AttachmentDTO[]> {
   
  // //  console.log(attachments)
  //   const attachmentData = [];
  //   for (const file of attachments) {
  //     console.log(file)
  //     // console.log(file.)
  //     const attachmentDTO = new AttachmentDTO();
  //     attachmentDTO.original = file.location;
  //     attachmentDTO.thumbnail = file.originalname;
  //     attachmentData.push(attachmentDTO);
  //   }
  //   await this.attachmentRepository.save(attachmentData);
  //   console.log("AttachmentData", attachmentData)
  //   return attachmentData;
  // }

  findAll() {
    return `This action returns all uploads`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }
}

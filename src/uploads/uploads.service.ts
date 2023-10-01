import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentRepository } from 'src/common/common.repository';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { Attachment } from 'src/common/entities/attachment.entity';

@Injectable()
export class UploadsService {

  constructor(
    @InjectRepository(AttachmentRepository) private attachmentRepository: AttachmentRepository,

  ) { }


  async uploadFile(attachment: Array<Express.Multer.File>): Promise<AttachmentDTO> {
    const attachmentData = new Attachment();
    attachmentData.original = attachment[0].originalname;
    attachmentData.thumbnail = attachment[0].path;

    await this.attachmentRepository.save(attachmentData);

    return attachmentData;
  }


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

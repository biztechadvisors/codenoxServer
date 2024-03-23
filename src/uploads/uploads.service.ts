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

  async uploadFile(attachments: Array<Express.Multer.File>): Promise<AttachmentDTO[]> {
    const attachmentData = [];
    for (const attachment of attachments) {
      const attachmentDTO = new AttachmentDTO();
      attachmentDTO.original = attachment.filename;
      attachmentDTO.thumbnail = attachment.path;
      attachmentData.push(attachmentDTO);
    }
    await this.attachmentRepository.save(attachmentData);

    return attachmentData;
  }

  async findAll(): Promise<Attachment[]> {
    return this.attachmentRepository.find();
  }

  async findOne(id: number): Promise<Attachment> {
    return this.attachmentRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.attachmentRepository.delete(id);
  }
}

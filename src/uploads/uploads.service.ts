import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { Attachment } from 'src/common/entities/attachment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentRepository } from 'src/common/common.repository';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(AttachmentRepository)
    private attachmentRepository: AttachmentRepository,
    private readonly configService: ConfigService,
  ) { }

  s3 = new S3({
    accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
    secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
  });

  async uploadFiles(files: Express.Multer.File | Express.Multer.File[]): Promise<{ data: { upload: AttachmentDTO[] } }> {
    const filesArray = Array.isArray(files) ? files : [files];
    const uploadPromises = filesArray.map(file => this.uploadToS3(file.buffer, file.originalname, file.mimetype));
    const results = await Promise.all(uploadPromises);

    // Construct the response object
    const uploadData = {
      data: {
        upload: results.map(result => ({
          original: result.original,
          thumbnail: result.thumbnail,
          id: result.id,
          __typename: 'Attachment'
        }))
      }
    };

    return uploadData;
  }


  private async uploadToS3(buffer: Buffer, originalname: string, mimetype: string): Promise<AttachmentDTO> {
    const params = {
      Bucket: this.configService.get('AWS_BUCKET'),
      Key: originalname,
      Body: buffer,
      ContentType: mimetype,
    };

    try {
      const uploadResult = await this.s3.upload(params).promise();
      const attachmentDTO = new AttachmentDTO();
      attachmentDTO.original = originalname;
      attachmentDTO.thumbnail = uploadResult.Location;

      return await this.attachmentRepository.save(attachmentDTO);
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3: ' + error.message);
    }
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

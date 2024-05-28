import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { Attachment } from 'src/common/entities/attachment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentRepository } from 'src/common/common.repository';
import sharp from 'sharp';

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

  async uploadFiles(files: Express.Multer.File | Express.Multer.File[]) {
    const filesArray = Array.isArray(files) ? files : [files];
    const uploadPromises = filesArray.map(file => this.compressAndUploadToS3(file.buffer, file.originalname, file.mimetype));
    const results = await Promise.all(uploadPromises);

    // Construct the response object
    const attachments = results.map(result => ({
      original: result.original,
      thumbnail: result.thumbnail,
      id: result.id,
    }));

    return attachments;
  }

  private async compressAndUploadToS3(buffer: Buffer, originalname: string, mimetype: string): Promise<AttachmentDTO> {
    let compressedBuffer = buffer;
    try {
      // Compress the image using sharp and adjust quality until the size is below 5 MB
      let quality = 90;
      while (compressedBuffer.length > 5 * 1024 * 1024 && quality > 10) {
        compressedBuffer = await sharp(buffer)
          .jpeg({ quality })
          .toBuffer();
        quality -= 10;
      }

      const params = {
        Bucket: this.configService.get('AWS_BUCKET'),
        Key: originalname,
        Body: compressedBuffer,
        ContentType: mimetype,
      };

      const uploadResult = await this.s3.upload(params).promise();
      const attachmentDTO = new AttachmentDTO();
      attachmentDTO.original = uploadResult.Location;
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
    // Retrieve the attachment record from the database
    const attachment = await this.attachmentRepository.findOne({ where: { id: id } });

    if (!attachment) {
      throw new Error(`Attachment with ID ${id} not found`);
    }

    // Extract the S3 key from the attachment's URL
    const bucket = this.configService.get('AWS_BUCKET');
    const url = attachment.original;
    const key = url.substring(url.lastIndexOf('/') + 1);

    // Delete the file from the S3 bucket
    try {
      await this.s3.deleteObject({ Bucket: bucket, Key: key }).promise();
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file from S3: ' + error.message);
    }

    // Delete the attachment record from the database
    await this.attachmentRepository.delete(id);
  }
}

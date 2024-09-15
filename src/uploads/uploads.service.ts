import { Injectable, BadRequestException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { Attachment } from 'src/common/entities/attachment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import sharp from 'sharp';
import * as mime from 'mime-types';
import * as stream from 'stream';
import { promisify } from 'util';
import { Repository } from 'typeorm';

@Injectable()
export class UploadsService {
  private readonly maxFileSizeMB = 100; // Set a maximum file size limit, e.g., 100 MB
  private readonly multipartChunkSize = 5 * 1024 * 1024; // Set chunk size for multipart upload, e.g., 5 MB

  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    private readonly configService: ConfigService,
  ) { }

  private s3 = new S3({
    accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
    secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
    region: this.configService.get('AWS_REGION'),
  });

  async uploadFiles(files: Express.Multer.File | Express.Multer.File[]) {
    const filesArray = Array.isArray(files) ? files : [files];
    const uploadPromises = filesArray.map(file => this.processAndUploadFile(file));
    const results = await Promise.all(uploadPromises);

    return results.map(result => ({
      original: result.original,
      thumbnail: result.thumbnail,
      id: result.id,
    }));
  }

  private async processAndUploadFile(file: Express.Multer.File): Promise<AttachmentDTO> {
    const mimetype = mime.lookup(file.originalname);

    if (!mimetype) {
      throw new BadRequestException('Invalid file type');
    }

    // Check file size
    if (file.size > this.maxFileSizeMB * 1024 * 1024) {
      throw new BadRequestException('File exceeds maximum size limit');
    }

    let buffer = file.buffer;

    if (mimetype.startsWith('image/')) {
      buffer = await this.compressImage(buffer, mimetype);
    }

    const params = {
      Bucket: this.configService.get('AWS_BUCKET'),
      Key: file.originalname,
      Body: buffer,
      ContentType: mimetype,
    };

    const uploadResult = await this.s3.upload(params).promise();
    const attachmentDTO = new AttachmentDTO();
    attachmentDTO.original = uploadResult.Location;

    if (mimetype.startsWith('image/')) {
      attachmentDTO.thumbnail = await this.generateThumbnail(buffer, file.originalname);
    } else {
      attachmentDTO.thumbnail = uploadResult.Location;
    }

    return await this.attachmentRepository.save(attachmentDTO);
  }

  private async compressImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
    let compressedBuffer = buffer;
    try {
      let quality = 90;
      while (compressedBuffer.length > 5 * 1024 * 1024 && quality > 10) {
        compressedBuffer = await sharp(buffer)
          .toFormat(mime.extension(mimetype))
          .jpeg({ quality })
          .toBuffer();
        quality -= 10;
      }
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Failed to compress image: ' + error.message);
    }
    return compressedBuffer;
  }

  private async generateThumbnail(buffer: Buffer, originalname: string): Promise<string> {
    try {
      const thumbnailBuffer = await sharp(buffer)
        .resize({ width: 200 })
        .toBuffer();

      const thumbnailKey = `thumbnails/${originalname}`;
      const params = {
        Bucket: this.configService.get('AWS_BUCKET'),
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: mime.lookup(originalname),
      };

      const uploadResult = await this.s3.upload(params).promise();
      return uploadResult.Location;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error('Failed to generate thumbnail: ' + error.message);
    }
  }

  async findAll(): Promise<Attachment[]> {
    return this.attachmentRepository.find();
  }

  async findOne(id: number): Promise<Attachment> {
    return this.attachmentRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({ where: { id } });

    if (!attachment) {
      throw new Error(`Attachment with ID ${id} not found`);
    }

    const bucket = this.configService.get('AWS_BUCKET');
    const key = attachment.original.substring(attachment.original.lastIndexOf('/') + 1);

    try {
      await this.s3.deleteObject({ Bucket: bucket, Key: key }).promise();
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file from S3: ' + error.message);
    }

    await this.attachmentRepository.delete(id);
  }
}

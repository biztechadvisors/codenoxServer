/// <reference types="multer" />
import { ConfigService } from '@nestjs/config';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Repository } from 'typeorm';
export declare class UploadsService {
    private attachmentRepository;
    private readonly configService;
    private readonly maxFileSizeMB;
    private readonly multipartChunkSize;
    constructor(attachmentRepository: Repository<Attachment>, configService: ConfigService);
    private s3;
    uploadFiles(files: Express.Multer.File | Express.Multer.File[]): Promise<{
        original: string;
        thumbnail: string;
        id: number;
    }[]>;
    private processAndUploadFile;
    private compressImage;
    private generateThumbnail;
    findAll(): Promise<Attachment[]>;
    findOne(id: number): Promise<Attachment>;
    remove(id: number): Promise<void>;
}

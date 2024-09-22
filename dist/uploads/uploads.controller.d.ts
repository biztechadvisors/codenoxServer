/// <reference types="multer" />
import { UploadsService } from './uploads.service';
import { Attachment } from 'src/common/entities/attachment.entity';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadFile(attachments: Array<Express.Multer.File>): Promise<{
        original: string;
        thumbnail: string;
        id: number;
    }[]>;
    findAll(): Promise<Attachment[]>;
    findOne(id: string): Promise<Attachment>;
    remove(id: string): Promise<void>;
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const aws_sdk_1 = require("aws-sdk");
const config_1 = require("@nestjs/config");
const attachment_dto_1 = require("../common/dto/attachment.dto");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const typeorm_1 = require("@nestjs/typeorm");
const sharp_1 = __importDefault(require("sharp"));
const mime = __importStar(require("mime-types"));
const typeorm_2 = require("typeorm");
let UploadsService = class UploadsService {
    constructor(attachmentRepository, configService) {
        this.attachmentRepository = attachmentRepository;
        this.configService = configService;
        this.maxFileSizeMB = 100;
        this.multipartChunkSize = 5 * 1024 * 1024;
        this.s3 = new aws_sdk_1.S3({
            accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
            secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
            region: this.configService.get('AWS_REGION'),
        });
    }
    async uploadFiles(files) {
        const filesArray = Array.isArray(files) ? files : [files];
        const uploadPromises = filesArray.map(file => this.processAndUploadFile(file));
        const results = await Promise.all(uploadPromises);
        return results.map(result => ({
            original: result.original,
            thumbnail: result.thumbnail,
            id: result.id,
        }));
    }
    async processAndUploadFile(file) {
        const mimetype = mime.lookup(file.originalname);
        if (!mimetype) {
            throw new common_1.BadRequestException('Invalid file type');
        }
        if (file.size > this.maxFileSizeMB * 1024 * 1024) {
            throw new common_1.BadRequestException('File exceeds maximum size limit');
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
        const attachmentDTO = new attachment_dto_1.AttachmentDTO();
        attachmentDTO.original = uploadResult.Location;
        if (mimetype.startsWith('image/')) {
            attachmentDTO.thumbnail = await this.generateThumbnail(buffer, file.originalname);
        }
        else {
            attachmentDTO.thumbnail = uploadResult.Location;
        }
        return await this.attachmentRepository.save(attachmentDTO);
    }
    async compressImage(buffer, mimetype) {
        let compressedBuffer = buffer;
        try {
            let quality = 90;
            while (compressedBuffer.length > 5 * 1024 * 1024 && quality > 10) {
                compressedBuffer = await (0, sharp_1.default)(buffer)
                    .toFormat(mime.extension(mimetype))
                    .jpeg({ quality })
                    .toBuffer();
                quality -= 10;
            }
        }
        catch (error) {
            console.error('Error compressing image:', error);
            throw new Error('Failed to compress image: ' + error.message);
        }
        return compressedBuffer;
    }
    async generateThumbnail(buffer, originalname) {
        try {
            const thumbnailBuffer = await (0, sharp_1.default)(buffer)
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
        }
        catch (error) {
            console.error('Error generating thumbnail:', error);
            throw new Error('Failed to generate thumbnail: ' + error.message);
        }
    }
    async findAll() {
        return this.attachmentRepository.find();
    }
    async findOne(id) {
        return this.attachmentRepository.findOne({ where: { id } });
    }
    async remove(id) {
        const attachment = await this.attachmentRepository.findOne({ where: { id } });
        if (!attachment) {
            throw new Error(`Attachment with ID ${id} not found`);
        }
        const bucket = this.configService.get('AWS_BUCKET');
        const key = attachment.original.substring(attachment.original.lastIndexOf('/') + 1);
        try {
            await this.s3.deleteObject({ Bucket: bucket, Key: key }).promise();
        }
        catch (error) {
            console.error('Error deleting file from S3:', error);
            throw new Error('Failed to delete file from S3: ' + error.message);
        }
        await this.attachmentRepository.delete(id);
    }
};
UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], UploadsService);
exports.UploadsService = UploadsService;
//# sourceMappingURL=uploads.service.js.map
import { Attachment } from '../entities/attachment.entity';

export class AttachmentDTO extends Attachment {
    id: number;
    thumbnail: string;
    original: string;
}

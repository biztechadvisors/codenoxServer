import { Attachment } from '../entities/attachment.entity';

export class AttachmentDTO extends Attachment {
    thumbnail: string;
    original: string;
}

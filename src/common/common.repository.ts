import { Repository } from 'typeorm';
import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator';
import { Attachment } from './entities/attachment.entity';

@CustomRepository(Attachment)
export class AttachmentRepository extends Repository<Attachment> { }
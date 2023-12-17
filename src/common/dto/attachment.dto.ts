/* eslint-disable prettier/prettier */
import { Attachment } from '../entities/attachment.entity'

// attachment.dto.ts
export class AttachmentDTO {
  id?: number
  thumbnail: string = '' // provide a default value
  original: string = '' // provide a default value
}

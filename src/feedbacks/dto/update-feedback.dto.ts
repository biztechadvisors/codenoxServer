/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/swagger'
import { CreateFeedBackDto } from './create-feedback.dto'

export class UpdateFeedBackDto extends PartialType(CreateFeedBackDto) {}

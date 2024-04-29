/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto, CreateSubCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }

export class UpdateSubCategoryDto extends PartialType(CreateSubCategoryDto) { }

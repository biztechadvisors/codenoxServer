import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';

export class TypeSettingsDTO {
  id: number;
  isHome: boolean;
  layoutType: string;
  productCard: string;
  types: CreateTypeDto[];
}

export class BannerDTO {
  id: number;
  title?: string;
  description?: string;
  image: AttachmentDTO;
  types: CreateTypeDto[];
}

export class CreateTypeDto {
  id: number;
  name: string;
  slug: string;
  image: AttachmentDTO;
  icon: string;
  banners: BannerDTO[];
  promotionalSliders: AttachmentDTO[];
  settings: TypeSettingsDTO;
  language: string;
  translatedLanguages: string[];
}

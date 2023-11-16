import { AttachmentDTO } from 'src/common/dto/attachment.dto';

export class BannerDto {
  id: number;
  title?: string;
  description?: string;
  image: AttachmentDTO[];
}

export class TypeSettingsDto {
  id?: number;
  isHome: boolean;
  layoutType: string;
  productCard: string;
}

export class CreateTypeDto {
  language: string;
  name: string;
  icon: string;
  slug: string;
  settings: TypeSettingsDto;
  promotional_sliders: AttachmentDTO[];
  banners: BannerDto[];
  translated_languages: string[];
}

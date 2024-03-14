/* eslint-disable prettier/prettier */
import { AttachmentDTO } from 'src/common/dto/attachment.dto'

// banner.dto.ts
export class BannerDto {
  id: number;
  title?: string;
  description?: string;
  image: AttachmentDTO;
}

// type-settings.dto.ts
export class TypeSettingsDto {
  isHome: boolean;
  productCard: string;
  layoutType: string;
}

// create-type.dto.ts
export class CreateTypeDto {
  language: string;
  name: string;
  shop_id: number;
  icon: string;
  slug: string;
  settings: TypeSettingsDto;
  promotional_sliders: AttachmentDTO[];
  banners: BannerDto[];
  translated_languages: string[];
}

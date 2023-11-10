import { PickType } from "@nestjs/swagger";
import { Type, TypeSettings, Banner } from "../entities/type.entity";
import { AttachmentDTO } from "src/common/dto/attachment.dto";
import { CoreEntity } from "src/common/entities/core.entity";

// type-settings.dto.ts
export class TypeSettingsDTO {
  id?: number;
  isHome?: boolean;
  layoutType?: string;
  productCard?: string;
}
// banner.dto.ts
export class BannerDTO {
  id?: number;
  title?: string;
  description?: string;
  image?: AttachmentDTO;
}
// type.dto.ts
export class CreateTypeDto {
  id?: number;
  name?: string;
  slug?: string;
  image?: AttachmentDTO;
  icon?: string;
  banners?: BannerDTO[];
  promotionalSliders?: AttachmentDTO[];
  settings?: TypeSettingsDTO;
  language?: string;
  translatedLanguages?: string[];
}




import { PickType } from "@nestjs/swagger";
import { Type, TypeSettings, Banner } from "../entities/type.entity";
import { AttachmentDTO } from "src/common/dto/attachment.dto";

export class CreateTypeDto extends PickType(Type, [
  'name',
  'slug',
  'icon',
  'language',
  'translated_languages',
]) {
  image?: AttachmentDTO[] | null;
  bannerIds: BannerDto[];
  promotionalSliderIds: number[];
  settings: TypeSettingsDto;
}


export class TypeSettingsDto extends PickType(TypeSettings, [
  'isHome',
  'layoutType',
  'productCard',
]) { }


export class BannerDto extends PickType(Banner, [
  'id',
  'title',
  'description',
]) {
  image: AttachmentDTO;
}
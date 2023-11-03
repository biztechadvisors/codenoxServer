import { PickType } from "@nestjs/swagger";
import { Banner, Type, TypeSettings } from "../entities/type.entity";
import { AttachmentDTO } from "src/common/dto/attachment.dto";

export class CreateTypeDto extends PickType(Type, [
    'name',
    'slug',
    'icon',
    'language',
    'translated_languages'
]) {
    imageId: number;
    bannerIds: number[];
    promotionalSliderIds: number[];
    settingsId: number;
}

export class BannerDto extends PickType(Banner, [
    "title",
    "description"
]) {
    imageId: number;
}

export class TypeSettingsDto extends PickType(TypeSettings, [
    "isHome",
    "layoutType",
    "productCard"
]) { }

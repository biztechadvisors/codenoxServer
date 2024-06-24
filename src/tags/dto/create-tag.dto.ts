/* eslint-disable prettier/prettier */

export class CreateTagDto {
  name: string;
  icon: string;
  details: string;
  language: string;
  translatedLanguages: string[];
  shopSlug: string;
  image?: { id: number };
  type_id?: number;
  parent?: number;
}

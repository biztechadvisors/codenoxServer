/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { SettingsOptionsDto } from './create-setting.dto';

export class UpdateSettingDto extends PartialType(SettingsOptionsDto) {}

/* eslint-disable prettier/prettier */
import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { Setting, SettingsOptions } from "./entities/setting.entity";

@CustomRepository(Setting)
export class SettingRepository extends Repository<Setting>{}

@CustomRepository(SettingsOptions)
export class SettingsOptionsRepository extends Repository<SettingsOptions>{}
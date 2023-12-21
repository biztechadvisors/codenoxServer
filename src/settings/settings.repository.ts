/* eslint-disable prettier/prettier */
import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { ContactDetails, Setting, SettingsOptions } from "./entities/setting.entity";

@CustomRepository(Setting)
export class SettingRepository extends Repository<Setting>{}

@CustomRepository(SettingsOptions)
export class SettingsOptionsRepository extends Repository<SettingsOptions>{}

@CustomRepository(ContactDetails)
export class ContactDetailsRepository extends Repository<ContactDetails>{}
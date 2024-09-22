import { CreateSettingDto } from './dto/create-setting.dto';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    create(shopId: number, createSettingDto: CreateSettingDto): Promise<import("./entities/setting.entity").Setting | {
        message: string;
    }>;
    update(id: number, updateSettingDto: UpdateSettingDto): Promise<import("./entities/setting.entity").Setting>;
    findOne(shopSlug: string): Promise<any>;
    remove(id: number): Promise<string>;
}

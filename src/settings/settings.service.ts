/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateSettingDto } from './dto/create-setting.dto'
import { UpdateSettingDto } from './dto/update-setting.dto'
import { Setting, SettingsOptions } from './entities/setting.entity'
import settingsJson from '@db/settings.json'
import { InjectRepository } from '@nestjs/typeorm'
import { SettingRepository, SettingsOptionsRepository } from './settings.repository'

const settings = plainToClass(Setting, settingsJson)

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingRepository)
    private settingRepository: SettingRepository,
    @InjectRepository(SettingsOptionsRepository)
    private settingsOptionsRepository: SettingsOptionsRepository,
  ) { }
  private settings: Setting = settings

  async create(createSettingDto: CreateSettingDto): Promise<Setting> {

    let value4: any
    const newSettings = new Setting()
    const newOptions = new SettingsOptions()

    try {
      newSettings.created_at = new Date()
      newSettings.language = createSettingDto.language
      //  newSettings.translated_languages = createSettingDto.translated_languages
      newSettings.updated_at = new Date()

      // const setting = await this.settingRepository.save(newSettings)

      if (createSettingDto.options) {

        newOptions.currency = createSettingDto.options.currency
        newOptions.currencyToWalletRatio = createSettingDto.options.currencyToWalletRatio
        newOptions.freeShipping = createSettingDto.options.freeShipping
        newOptions.freeShippingAmount = createSettingDto.options.freeShippingAmount
        newOptions.guestCheckout = createSettingDto.options.guestCheckout

        const option = await this.settingsOptionsRepository.save(newOptions)

        value4 = option

      }

      newSettings.options = value4
      const setting = await this.settingRepository.save(newSettings)
      console.log("first", setting)

      return setting
    } catch (error) {
      console.error(error)
    }
  }

  findAll() {
    return this.settings
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`
  }

  update(id: number, updateSettingDto: UpdateSettingDto) {
    return this.settings
  }

  remove(id: number) {
    return `This action removes a #${id} setting`
  }
}

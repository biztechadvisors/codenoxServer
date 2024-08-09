/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { GetStoreNoticesDto } from './dto/get-store-notices.dto'
import { StoreNotice } from './entities/store-notices.entity'
import Fuse from 'fuse.js'
import { paginate } from 'src/common/pagination/paginate'
import { CreateStoreNoticeDto } from './dto/create-store-notice.dto'
import { UpdateStoreNoticeDto } from './dto/update-store-notice.dto'

@Injectable()
export class StoreNoticesService {
  create(createStoreNoticeDto: CreateStoreNoticeDto) {
    return []
  }

  getStoreNotices({ search, limit, page }: GetStoreNoticesDto) {
    if (!page) page = 1
    if (!limit) limit = 12
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let data: StoreNotice[] = []

    if (search) {
      const parseSearchParams = search.split(';')
      const searchText: any = []
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':')
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          })
        }
      }

      data = []
    }

    const results = data.slice(startIndex, endIndex)
    const url = `/store-notices?search=${search}&limit=${limit}`
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    }
  }

  getStoreNotice(param: string, language: string) {
    return []
  }

  update(id: number, updateStoreNoticeDto: UpdateStoreNoticeDto) {
    return []
  }

  remove(id: number) {
    return `This action removes a #${id} store notice`
  }
}

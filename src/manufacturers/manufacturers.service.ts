/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { Manufacturer } from './entities/manufacturer.entity'
import { plainToClass } from 'class-transformer'
import Fuse from 'fuse.js'
import { GetTopManufacturersDto } from './dto/get-top-manufacturers.dto'
import {
  GetManufacturersDto,
  ManufacturerPaginator,
} from './dto/get-manufactures.dto'
import { paginate } from '../common/pagination/paginate'
import { CreateManufacturerDto } from './dto/create-manufacturer.dto'
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto'

const options = {
  keys: ['name'],
  threshold: 0.3,
}

@Injectable()
export class ManufacturersService {

  create(createManufactureDto: CreateManufacturerDto) {
    return []
  }

  async getManufactures({
    limit,
    page,
    search,
  }: GetManufacturersDto): Promise<ManufacturerPaginator> {
    if (!page) page = 1
    if (!limit) limit = 30
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let data: Manufacturer[] = []
    if (search) {
      const parseSearchParams = search.split(';')
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':')
        data = []
      }
    }

    const results = data.slice(startIndex, endIndex)
    const params = new URLSearchParams();

    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());

    const url = `/manufacturers?${params.toString()}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    }
  }

  async getTopManufactures({
    limit = 10,
  }: GetTopManufacturersDto): Promise<Manufacturer[]> {
    return []
  }

  async getManufacturesBySlug(slug: string): Promise<any> {
    return []
  }

  update(id: number, updateManufacturesDto: UpdateManufacturerDto) {
    const manufacturer = {}

    return manufacturer
  }

  remove(id: number) {
    return `This action removes a #${id} product`
  }
}

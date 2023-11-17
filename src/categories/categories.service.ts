/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateCategoryDto } from './dto/create-category.dto'
import { GetCategoriesDto } from './dto/get-categories.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Category } from './entities/category.entity'
import Fuse from 'fuse.js'
import categoriesJson from '@db/categories.json'
import { paginate } from 'src/common/pagination/paginate'
import { InjectRepository } from '@nestjs/typeorm'
import { CategoryRepository } from './categories.repository'
import { AttachmentRepository } from 'src/common/common.repository'
import { Attachment } from 'src/common/entities/attachment.entity'
import { convertToSlug } from 'src/helpers'

const categories = plainToClass(Category, categoriesJson)
const options = {
  keys: ['name', 'type.slug'],
  threshold: 0.3,
}
const fuse = new Fuse(categories, options)

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryRepository)
    private categoryRepository: CategoryRepository,
    @InjectRepository(AttachmentRepository)
    private attachmentRepository: AttachmentRepository,
  ) {}

  async convertToSlug(text) {
    return await convertToSlug(text)
  }

  private categories: Category[] = categories

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Create a new Attachment instance

    console.log("Data", createCategoryDto)
    const attachment = new Attachment();

    // Set the Attachment properties from the CreateCategoryDto
    attachment.thumbnail = createCategoryDto.image.thumbnail
    attachment.original = createCategoryDto.image.original

    const parent = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    })

    console.log('Parent', parent)
    // Save the Attachment instance to the database
    await this.attachmentRepository.save(attachment)

    const slug = await this.convertToSlug(createCategoryDto.name)
    // Create a new Category instance
    const category = new Category()

    // Set the Category properties from the CreateCategoryDto
    category.name = createCategoryDto.name
    category.slug = slug
    category.type = createCategoryDto.type
    category.details = createCategoryDto.details
    // category.parent = await this.categoryRepository.findOne({ where: { name: createCategoryDto.name } });
    category.image = attachment
    category.icon = createCategoryDto.icon
    category.language = createCategoryDto.language

    // If the parent ID is not set, set it to null
    if (!category.parent) {
      category.parent = null
    }

    // Save the Category instance to the database
    await this.categoryRepository.save(category)

    // Return the saved Category instance
    return category
  }

  getCategories({ limit, page, search, parent }: GetCategoriesDto) {
    if (!page) page = 1
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    let data: Category[] = this.categories
    if (search) {
      const parseSearchParams = search.split(';')
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':')
        // data = data.filter((item) => item[key] === value);
        data = fuse.search(value)?.map(({ item }) => item)
      }
    }
    if (parent === 'null') {
      data = data.filter((item) => item.parent === null)
    }
    // if (text?.replace(/%/g, '')) {
    //   data = fuse.search(text)?.map(({ item }) => item);
    // }
    // if (hasType) {
    //   data = fuse.search(hasType)?.map(({ item }) => item);
    // }

    const results = data.slice(startIndex, endIndex)
    const url = `/categories?search=${search}&limit=${limit}&parent=${parent}`
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    }
  }

  getCategory(param: string, language: string): Category {
    return this.categories.find(
      (p) => p.id === Number(param) || p.slug === param,
    )
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Find the Category instance to be updated
    const category = await this.categoryRepository.findOne({
      where: { id },
    })

    // If the Category instance is not found, throw an error
    if (!category) {
      throw new Error('Category not found')
    }

    // Set the Category properties from the UpdateCategoryDto
    category.name = updateCategoryDto.name
    category.type = updateCategoryDto.type
    category.details = updateCategoryDto.details
    category.parent = updateCategoryDto.parent
    category.image = updateCategoryDto.image
    category.icon = updateCategoryDto.icon
    category.language = updateCategoryDto.language

    // Save the Category instance to the database
    await this.categoryRepository.save(category)

    // Return the saved Category instance
    // return this.categories[0];

    return category
  }

  remove(id: number) {
    return `This action removes a #${id} category`
  }
}

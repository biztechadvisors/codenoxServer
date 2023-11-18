/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateCategoryDto } from './dto/create-category.dto'
import { CategoryPaginator, GetCategoriesDto } from './dto/get-categories.dto'
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
import { TypeRepository } from 'src/types/types.repository'
import { ILike, IsNull } from 'typeorm'

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
    @InjectRepository(TypeRepository) private typeRepository: TypeRepository,
  ) {}

  async convertToSlug(text) {
    return await convertToSlug(text)
  }

  private categories: Category[] = categories

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Create a new Attachment instance
    const attachment = this.attachmentRepository.create()
    // Set the Attachment properties from the CreateCategoryDto
    attachment.thumbnail = createCategoryDto.image.thumbnail
    attachment.original = createCategoryDto.image.original
    // Save the Attachment instance to the database
    await this.attachmentRepository.save(attachment)
    // Get the Type entity by name
    const type = await this.typeRepository.findOne({
      where: { name: createCategoryDto.type_name },
    })
    if (!type) {
      // Handle the case when the type is not found
      throw new Error(
        `Type with name '${createCategoryDto.type_name}' not found`,
      )
    }
    // Create a new Category instance
    const category = this.categoryRepository.create()
    // Set the Category properties from the CreateCategoryDto
    category.name = createCategoryDto.name as string // Explicitly type name as a string
    category.slug = await this.convertToSlug(createCategoryDto.name)
    category.type = type
    category.details = createCategoryDto.details
    category.parent = null // or set it to the appropriate parent
    category.image = attachment
    category.icon = createCategoryDto.icon
    category.language = createCategoryDto.language
    // Save the Category instance to the database
    await this.categoryRepository.save(category)
    // Return the saved Category instance
    return category
  }

  async getCategories(query: GetCategoriesDto): Promise<CategoryPaginator> {
    const { limit, page, search, parent } = query
    const skip = (Number(page) - 1) * limit
    const where: { [key: string]: any } = {}
    if (search) {
      where['name'] = ILike(`%${search}%`)
    }
    if (parent === 'null') {
      where['parent'] = IsNull()
    } else if (parent) {
      where['parent'] = parent
    }
    const [data, total] = await this.categoryRepository.findAndCount({
      where,
      take: limit,
      skip,
      relations: ['type'],
    })
    const url = `/categories?search=${search}&limit=${limit}&parent=${parent}`
    return {
      data,
      ...paginate(total, page, limit, data.length, url),
    }
  }

  async getCategory(param: string, language: string): Promise<Category> {
    // Try to parse the param as a number to see if it's an id
    const id = Number(param)
    if (!isNaN(id)) {
      // If it's an id, find the category by id
      return this.categoryRepository.findOne({
        where: { id: id, language: language },
        relations: ['type', 'image'],
      })
    } else {
      // If it's not an id, find the category by slug
      return this.categoryRepository.findOne({
        where: { slug: param, language: language },
        relations: ['type', 'image'],
      })
    }
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Find the Category instance to be updated
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['type', 'image'],
    })
    // If the Category instance is not found, throw an error
    if (!category) {
      throw new Error('Category not found')
    }

    if (updateCategoryDto.image !== category.image) {
      // Find categories that reference the image to be deleted
      const referencingCategories = await this.categoryRepository.find({
        where: { image: category.image },
      })
      // If the image is only referenced by the current category, it's safe to delete
      if (referencingCategories.length === 1) {
        const image = category.image
        // Set the imageId to null in the category table before deleting the attachment
        category.image = null
        await this.categoryRepository.save(category)
        await this.attachmentRepository.remove(image)
      }
    }
    // Set the Category properties from the UpdateCategoryDto
    category.name = updateCategoryDto.name
    category.slug = await this.convertToSlug(updateCategoryDto.name)
    category.type = updateCategoryDto.type
    category.details = updateCategoryDto.details
    category.parent = updateCategoryDto.parent
    category.image = updateCategoryDto.image
    category.icon = updateCategoryDto.icon
    category.language = updateCategoryDto.language

    // Save the Category instance to the database
    const cat = await this.categoryRepository.save(category)
    // Return the saved Category instance
    return cat
  }

  async remove(id: number): Promise<void> {
    // Find the Category instance to be removed
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['image'],
    })
    // If the Category instance is not found, throw an error
    if (!category) {
      throw new Error('Category not found')
    }
    // If the Category has an image, remove it first
    if (category.image) {
      const image = category.image
      // Set the imageId to null in the category table before deleting the attachment
      category.image = null
      await this.categoryRepository.save(category)
      // Now, delete the image (attachment)
      await this.attachmentRepository.remove(image)
    }
    // Remove the Category instance from the database
    await this.categoryRepository.remove(category)
  }
}

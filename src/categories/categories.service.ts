import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryPaginator, GetCategoriesDto } from './dto/get-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import Fuse from 'fuse.js';
import categoriesJson from '@db/categories.json';
import { paginate } from 'src/common/pagination/paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from './categories.repository';
import { AttachmentRepository } from 'src/common/common.repository';
import { Attachment } from 'src/common/entities/attachment.entity';
import { convertToSlug } from 'src/helpers';
import { TypeRepository } from 'src/types/types.repository';
import { ILike, IsNull } from 'typeorm';

const categories = plainToClass(Category, categoriesJson);
const options = {
  keys: ['name', 'type.slug'],
  threshold: 0.3,
};
const fuse = new Fuse(categories, options);

@Injectable()
export class CategoriesService {

  constructor(
    @InjectRepository(CategoryRepository) private categoryRepository: CategoryRepository,
    @InjectRepository(AttachmentRepository) private attachmentRepository: AttachmentRepository,
    @InjectRepository(TypeRepository) private typeRepository: TypeRepository,

  ) { }


  async convertToSlug(text) {
    return await convertToSlug(text);
  }

  private categories: Category[] = categories;

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Save the Attachment instance to the database
    const attachment = await this.attachmentRepository.findOne({ where: { id: createCategoryDto.image_id } });
    if (!attachment) {
      // Handle the case when the type is not found
      throw new Error(`Type with name '${createCategoryDto.image_id}' not found`);
    }
    // Get the Type entity by name
    const type = await this.typeRepository.findOne({ where: { name: createCategoryDto.type_name } });
    if (!type) {
      // Handle the case when the type is not found
      throw new Error(`Type with name '${createCategoryDto.type_name}' not found`);
    }

    // Create a new Category instance
    const category = new Category();
    // Set the Category properties from the CreateCategoryDto
    category.name = createCategoryDto.name as string; // Explicitly type name as a string
    category.slug = await this.convertToSlug(createCategoryDto.name);
    category.type = type;
    category.details = createCategoryDto.details;
    category.parent = null; // or set it to the appropriate parent
    category.image = attachment;
    category.icon = createCategoryDto.icon;
    category.language = createCategoryDto.language;

    // Save the Category instance to the database
    return await this.categoryRepository.save(category);
  }

  async getCategories(query: GetCategoriesDto): Promise<CategoryPaginator> {
    let { limit = '10', page = '1', search, parent } = query;

    // Convert to numbers
    const numericPage = Number(page);
    const numericLimit = Number(limit);

    // Handle invalid values
    if (isNaN(numericPage) || isNaN(numericLimit)) {
      throw new BadRequestException('Page and limit values must be numbers');
    }

    const skip = (numericPage - 1) * numericLimit;
    const where: { [key: string]: any } = {};

    if (search) {
      where['name'] = ILike(`%${search}%`);
    }

    if (parent) {
      const parentID = Number(parent);
      if (!isNaN(parentID)) {
        where['parent'] = parentID;
      } else {
        where['parent'] = { id: parent };
      }
    }

    const [data, total] = await this.categoryRepository.findAndCount({
      where,
      take: numericLimit,
      skip,
      relations: ['type', 'image', 'children', 'parent'],
    });

    // Add type_id field to each item in the data array
    const formattedData = data.map(item => ({ ...item, type_id: item.type.id }));

    const url = `/categories?search=${search}&limit=${numericLimit}&parent=${parent}`;

    return {
      data: formattedData,
      ...paginate(total, numericPage, numericLimit, formattedData.length, url),
    };
  }

  async getCategory(param: string, language: string): Promise<Category> {
    // Try to parse the param as a number to see if it's an id
    const id = Number(param);
    if (!isNaN(id)) {
      // If it's an id, find the category by id
      return this.categoryRepository.findOne({ where: { id: id, language: language }, relations: ['type', 'image'] });
    } else {
      // If it's not an id, find the category by slug
      return this.categoryRepository.findOne({ where: { slug: param, language: language }, relations: ['type', 'image'] });
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['type', 'image'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.image && updateCategoryDto.image !== category.image) {
      const referencingCategories = await this.categoryRepository.find({ where: { image: category.image } });

      if (referencingCategories.length === 1) {
        const image = category.image;
        category.image = null;
        await this.categoryRepository.save(category);
        await this.attachmentRepository.remove(image);
      }
    }

    category.name = updateCategoryDto.name;
    category.slug = await this.convertToSlug(updateCategoryDto.name);
    category.type = updateCategoryDto.type;
    category.details = updateCategoryDto.details;
    category.parent = updateCategoryDto.parent;
    category.image = updateCategoryDto.image;
    category.icon = updateCategoryDto.icon;
    category.language = updateCategoryDto.language;

    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    // Find the Category instance to be removed
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['image'],
    });
    // If the Category instance is not found, throw an error
    if (!category) {
      throw new Error('Category not found');
    }
    // If the Category has an image, remove it first
    if (category.image) {
      const image = category.image;
      // Set the imageId to null in the category table before deleting the attachment
      category.image = null;
      await this.categoryRepository.save(category);
      // Now, delete the image (attachment)
      await this.attachmentRepository.remove(image);
    }
    // Remove the Category instance from the database
    await this.categoryRepository.remove(category);
  }

}

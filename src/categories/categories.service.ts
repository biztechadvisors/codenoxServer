/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateCategoryDto, CreateSubCategoryDto } from './dto/create-category.dto';
import { CategoryPaginator, GetCategoriesDto, GetSubCategoriesDto } from './dto/get-categories.dto';
import { UpdateCategoryDto, UpdateSubCategoryDto } from './dto/update-category.dto';
import { Category, SubCategory } from './entities/category.entity';
import Fuse from 'fuse.js';
import categoriesJson from '@db/categories.json';
import { paginate } from 'src/common/pagination/paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from './categories.repository';
import { AttachmentRepository } from 'src/common/common.repository';
import { Attachment } from 'src/common/entities/attachment.entity';
import { convertToSlug } from 'src/helpers';
import { TypeRepository } from 'src/types/types.repository';
import { ILike, IsNull, Repository } from 'typeorm';
import { Shop } from 'src/shops/entities/shop.entity';

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
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(SubCategory) private readonly subCategoryRepository: Repository<SubCategory>

  ) { }

  async convertToSlug(text) {
    return await convertToSlug(text)
  }

  // private categories: Category[] = categories

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {

    // Check if the image exists
    let imageAttachment;
    if (createCategoryDto.image.id) {
      imageAttachment = await this.attachmentRepository.findOne({ where: { id: createCategoryDto.image.id } });
      if (!imageAttachment) {
        throw new Error(`Attachment with id '${createCategoryDto.image_id}' not found`);
      }
    }

    // Check if the type exists
    const type = await this.typeRepository.findOne({ where: { id: createCategoryDto.type_id } });
    if (!type) {
      throw new Error(`Type with id '${createCategoryDto.type_id}' not found`);
    }

    // Create a new Category instance
    const category = new Category();
    category.name = createCategoryDto.name;
    category.slug = await this.convertToSlug(createCategoryDto.name);
    category.type = type;
    category.details = createCategoryDto.details;
    category.parent = null; // Set parent if required
    category.image = imageAttachment;
    category.icon = createCategoryDto.icon;
    category.language = createCategoryDto.language;
    const shop = await this.shopRepository.findOne({ where: { id: createCategoryDto.shop_id } });
    category.shop = shop;

    // Save the Category instance to the database
    return await this.categoryRepository.save(category);
  }

  async getCategories(query: GetCategoriesDto): Promise<CategoryPaginator> {
    let { limit = '10', page = '1', search, parent, shop } = query;

    console.log('shop****', shop)

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
      const type = await this.typeRepository.findOne({ where: { slug: search.split(':')[1] } });
      if (type) {
        where['type'] = { id: type.id };
      }
    }


    if (shop) {
      console.log('shop****', typeof shop)
      where['shop'] = typeof shop === "string" ? { id: Number(shop) } : { id: shop }; // This line is likely causing the error
    }


    if (parent) {
      where['parent'] = { id: parent };
    }

    const [data, total] = await this.categoryRepository.findAndCount({
      where,
      take: numericLimit,
      skip,
      relations: ['type', 'image', 'subCategories', 'shop'],
    });

    const url = `/categories?search=${search}&limit=${numericLimit}&parent=${parent}`;

    return {
      data,
      ...paginate(total, numericPage, numericLimit, data.length, url),
    };
  }


  async getCategory(param: string, language: string, shopId: number): Promise<Category> {
    // Try to parse the param as a number to see if it's an id
    const id = Number(param);
    if (!isNaN(id)) {
      // If it's an id, find the category by id
      return this.categoryRepository.findOne({
        where: { id: id, language: language, shop: { id: shopId } },
        relations: ['type', 'image', 'shop'],
      });
    } else {
      // If it's not an id, find the category by slug
      return this.categoryRepository.findOne({
        where: { slug: param, language: language, shop: { id: shopId } },
        relations: ['type', 'image', 'shop'],
      });
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

    if (updateCategoryDto.image) {
      const image = await this.attachmentRepository.findOne({ where: { id: updateCategoryDto.image.id } });
      if (!image) {
        throw new Error(`Image with id '${updateCategoryDto.image.id}' not found`);
      }
      const referencingCategories = await this.categoryRepository.find({ where: { image: category.image } });

      if (referencingCategories.length === 1) {
        const oldImage = category.image;
        category.image = null;
        await this.categoryRepository.save(category);
        await this.attachmentRepository.remove(oldImage);
      }
      category.image = image;
    }

    if (updateCategoryDto.type_id) {

      const type = await this.typeRepository.findOne({ where: { id: updateCategoryDto.type_id } });
      if (!type) {
        // Handle the case when the type is not found
        throw new Error(`Type with name '${updateCategoryDto.type_id}' not found`);
      }
      category.type = type;
    }

    category.name = updateCategoryDto.name;
    category.slug = await this.convertToSlug(updateCategoryDto.name);
    category.details = updateCategoryDto.details;
    category.parent = updateCategoryDto.parent;
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


  // SubCategory Services********************************

  async createSubCategory(createSubCategoryDto: CreateSubCategoryDto): Promise<SubCategory> {
    // Check if the image exists
    let imageAttachment;
    if (createSubCategoryDto.image?.id !== undefined) {
      imageAttachment = await this.attachmentRepository.findOne({ where: { id: createSubCategoryDto.image.id } });
      if (!imageAttachment) {
        throw new Error(`Attachment with id '${createSubCategoryDto.image.id}' not found`);
      }
    }

    // Check if the category exists
    const category = await this.categoryRepository.findOne({ where: { id: createSubCategoryDto.category_id } });
    if (!category) {
      throw new Error(`Category with id '${createSubCategoryDto.category_id}' not found`);
    }

    // Check if the shop exists
    const shop = await this.shopRepository.findOne({ where: { id: createSubCategoryDto.shop_id } });
    if (!shop) {
      throw new Error(`Shop with id '${createSubCategoryDto.shop_id}' not found`);
    }

    // Create a new SubCategory instance
    const subCategory = new SubCategory();
    subCategory.name = createSubCategoryDto.name;
    subCategory.slug = await this.convertToSlug(createSubCategoryDto.name);
    subCategory.category = category;
    subCategory.details = createSubCategoryDto.details;
    subCategory.image = imageAttachment;
    subCategory.language = createSubCategoryDto.language;
    subCategory.shop = shop;
    
    console.log("SUB_category&&&&&",subCategory);
    // Save the SubCategory instance to the database
    return await this.subCategoryRepository.save(subCategory);
  }

  async getSubCategory(param: string, language: string, shopId: number, categoryId: number): Promise<SubCategory> {
    // Try to parse the param as a number to see if it's an id
    const id = Number(param);

    console.log('param**', param, " ", shopId, " ", categoryId)
    if (!isNaN(id)) {
      // If it's an id, find the subcategory by id
      return this.subCategoryRepository.findOne({
        where: { id: id, shop: { id: shopId }, category: { id: categoryId } },
        relations: ['image', 'shop', 'category'],
      });
    } else {
      // If it's not an id, find the subcategory by slug
      return this.subCategoryRepository.findOne({
        where: { slug: param, language: language, shop: { id: shopId }, category: { id: categoryId } },
        relations: ['shop', 'image', 'category'],
      });
    }
  }


  async getSubCategories(query: GetSubCategoriesDto): Promise<SubCategory[]> {
    const { categoryId, shopId } = query;

    if (!categoryId && !shopId) {
      throw new BadRequestException('Either categoryId or shopId must be provided in the query');
    }

    let where: { [key: string]: any } = {};
    if (categoryId) {
      where['category'] = typeof categoryId === "string" ? { id: Number(categoryId) } : { id: categoryId };;
    }
    if (shopId) {
      where['shop'] = typeof shopId === "string" ? { id: Number(shopId) } : { id: shopId };;
    }

    const relations = ['category', 'image', 'shop'];
    return await this.subCategoryRepository.find({ where, relations });
  }

  async updateSubCategory(id: number, updateSubCategoryDto: UpdateSubCategoryDto): Promise<SubCategory> {
    const subCategory = await this.subCategoryRepository.findOne({
      where: { id },
      relations: ['category', 'image', 'shop'],
    });

    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }

    if (updateSubCategoryDto.image) {
      const image = await this.attachmentRepository.findOne({ where: { id: updateSubCategoryDto.image.id } });
      if (!image) {
        throw new Error(`Image with id '${updateSubCategoryDto.image.id}' not found`);
      }
      const referencingSubCategories = await this.subCategoryRepository.find({ where: { image: subCategory.image } });

      if (referencingSubCategories.length === 1) {
        const oldImage = subCategory.image;
        subCategory.image = null;
        await this.subCategoryRepository.save(subCategory);
        await this.attachmentRepository.remove(oldImage);
      }
      subCategory.image = image;
    }

    if (updateSubCategoryDto.category_id) {
      const category = await this.categoryRepository.findOne({ where: { id: updateSubCategoryDto.category_id } });
      if (!category) {
        throw new Error(`Category with id '${updateSubCategoryDto.category_id}' not found`);
      }
      subCategory.category = category;
    }

    subCategory.name = updateSubCategoryDto.name;
    subCategory.slug = await this.convertToSlug(updateSubCategoryDto.name);
    subCategory.details = updateSubCategoryDto.details;
    subCategory.language = updateSubCategoryDto.language;

    return this.subCategoryRepository.save(subCategory);
  }


  async removeSubCategory(id: number): Promise<void> {
    // Find the SubCategory instance to be removed
    const subCategory = await this.subCategoryRepository.findOne({
      where: { id },
      relations: ['image'],
    });

    if (!subCategory) {
      throw new Error('SubCategory not found');
    }

    // If the SubCategory has an image, remove it first
    if (subCategory.image) {
      const image = subCategory.image;
      // Set the imageId to null in the subcategory table before deleting the attachment
      subCategory.image = null;
      await this.subCategoryRepository.save(subCategory);
      // Now, delete the image (attachment)
      await this.attachmentRepository.remove(image);
    }

    // Remove the SubCategory instance from the database
    await this.subCategoryRepository.remove(subCategory);
  }


}

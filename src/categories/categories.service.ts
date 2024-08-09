/* eslint-disable prettier/prettier */
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateCategoryDto, CreateSubCategoryDto } from './dto/create-category.dto';
import { CategoryPaginator, GetCategoriesDto, GetSubCategoriesDto } from './dto/get-categories.dto';
import { UpdateCategoryDto, UpdateSubCategoryDto } from './dto/update-category.dto';
import { Category, SubCategory } from './entities/category.entity';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from './categories.repository';
import { AttachmentRepository } from 'src/common/common.repository';
import { Attachment } from 'src/common/entities/attachment.entity';
import { convertToSlug } from 'src/helpers';
import { TypeRepository } from 'src/types/types.repository';
import { ILike, IsNull, Like, Repository } from 'typeorm';
import { Shop } from 'src/shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const options = {
  keys: ['name', 'type.slug'],
  threshold: 0.3,
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryRepository)
    private categoryRepository: CategoryRepository,
    @InjectRepository(AttachmentRepository)
    private attachmentRepository: AttachmentRepository,
    @InjectRepository(TypeRepository) private typeRepository: TypeRepository,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(SubCategory) private readonly subCategoryRepository: Repository<SubCategory>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
    let { limit = '10', page = '1', search, parent, shopSlug, shopId, language, orderBy, sortedBy } = query;

    // Convert to numbers
    const numericPage = Number(page);
    const numericLimit = Number(limit);

    // Handle invalid values
    if (isNaN(numericPage) || isNaN(numericLimit)) {
      throw new BadRequestException('Page and limit values must be numbers');
    }

    const skip = (numericPage - 1) * numericLimit;

    const cacheKey = `categories-${numericPage}-${numericLimit}-${search || 'all'}-${parent || 'all'}-${shopSlug || 'all'}-${shopId || 'all'}-${language || 'all'}-${orderBy || 'none'}-${sortedBy || 'none'}`;

    let categories = await this.cacheManager.get<CategoryPaginator>(cacheKey);

    if (!categories) {
      const where: any = {};

      if (search) {
        where['name'] = Like(`%${search}%`);
      }

      if (shopSlug) {
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (shop) {
          where['shop'] = { id: shop.id };
        } else {
          throw new NotFoundException('Shop not found');
        }
      }

      if (shopId) {
        where['shop'] = { id: shopId };
      }

      if (parent && parent !== 'null') {
        where['parent'] = { id: parent };
      } else if (parent === 'null') {
        where['parent'] = IsNull();
      }

      if (language) {
        where['language'] = language;
      }

      const order = orderBy && sortedBy ? { [orderBy]: sortedBy.toUpperCase() } : {};

      const [data, total] = await this.categoryRepository.findAndCount({
        where,
        take: numericLimit,
        skip,
        relations: ['type', 'image', 'subCategories', 'shop'],
        order,
      });

      const url = `/categories?search=${search}&limit=${numericLimit}&parent=${parent}`;

      categories = {
        data,
        ...paginate(total, numericPage, numericLimit, data.length, url),
      };

      await this.cacheManager.set(cacheKey, categories, 3600); // Cache for 1 hour
    }

    return categories;
  }

  async getCategory(param: string, language: string, shopId: number): Promise<Category> {
    // Generate a unique cache key based on the parameters
    const cacheKey = `category-${param}-${language}-${shopId}`;

    // Try to get the category from cache
    let category = await this.cacheManager.get<Category>(cacheKey);

    if (!category) {
      // If not in cache, determine if param is an ID or slug
      const id = Number(param);

      if (!isNaN(id)) {
        // If param is an ID, find category by ID
        category = await this.categoryRepository.findOne({
          where: { id: id, language: language, shop: { id: shopId } },
          relations: ['type', 'image', 'shop'],
        });
      } else {
        // If param is a slug, find category by slug
        category = await this.categoryRepository.findOne({
          where: { slug: param, language: language, shop: { id: shopId } },
          relations: ['type', 'image', 'shop'],
        });
      }

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Cache the result
      await this.cacheManager.set(cacheKey, category, 3600); // Cache for 1 hour
    }

    return category;
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
      relations: ['image', 'subCategories'], // Ensure to load subCategories as well
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Nullify the relationship for sub-categories
    if (category.subCategories && category.subCategories.length > 0) {
      for (const subCategory of category.subCategories) {
        subCategory.category = null;
        await this.subCategoryRepository.save(subCategory);
      }
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

    // Save the SubCategory instance to the database
    return await this.subCategoryRepository.save(subCategory);
  }

  async getSubCategory(param: string, language: string, shopSlug: string): Promise<SubCategory> {
    // Try to parse the param as a number to see if it's an id
    const id = Number(param);

    if (!isNaN(id)) {
      // If it's an id, find the subcategory by id
      return this.subCategoryRepository.findOne({
        where: { id: id, shop: { slug: shopSlug } },
        relations: ['image', 'shop', 'category'],
      });
    } else {
      // If it's not an id, find the subcategory by slug
      return this.subCategoryRepository.findOne({
        where: { slug: param, language: language, shop: { slug: shopSlug } },
        relations: ['shop', 'image', 'category'],
      });
    }
  }

  async getSubCategories(query: GetSubCategoriesDto): Promise<SubCategory[]> {
    const { categoryId, shopSlug } = query;

    if (!categoryId && !shopSlug) {
      throw new BadRequestException('Either categoryId or shopSlug must be provided in the query');
    }

    let where: { [key: string]: any } = {};
    if (categoryId) {
      where['category'] = { id: Number(categoryId) };
    }
    if (shopSlug) {
      where['shop'] = { slug: shopSlug };
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

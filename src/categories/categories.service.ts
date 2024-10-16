/* eslint-disable prettier/prettier */
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, CreateSubCategoryDto } from './dto/create-category.dto';
import { CategoryPaginator, GetCategoriesDto, GetSubCategoriesDto, SubCategoryPaginator } from './dto/get-categories.dto';
import { UpdateCategoryDto, UpdateSubCategoryDto } from './dto/update-category.dto';
import { Category, SubCategory } from './entities/category.entity';
import { paginate } from 'src/common/pagination/paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from 'src/common/entities/attachment.entity';
import { convertToSlug } from 'src/helpers';
import { In, IsNull, Like, Repository } from 'typeorm';
import { Shop } from 'src/shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Region } from '../region/entities/region.entity';
import { Type } from '../types/entities/type.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Type) private readonly typeRepository: Repository<Type>,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(SubCategory) private readonly subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(Region) private readonly regionRepository: Repository<Region>,

    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

  ) { }

  async convertToSlug(text) {
    return await convertToSlug(text)
  }

  // private categories: Category[] = categories

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if the image exists
    let imageAttachment;
    if (createCategoryDto.image?.id) {
      imageAttachment = await this.attachmentRepository.findOne({ where: { id: createCategoryDto.image.id } });
      if (!imageAttachment) {
        throw new Error(`Attachment with id '${createCategoryDto.image?.id}' not found`);
      }
    }

    // Check if the type exists
    const type = await this.typeRepository.findOne({ where: { id: createCategoryDto.type_id } });
    if (!type) {
      throw new Error(`Type with id '${createCategoryDto.type_id}' not found`);
    }

    // Create a new Category instance
    const category = new Category();

    // Handling regions
    if (createCategoryDto.region_name && createCategoryDto.region_name.length > 0) {
      const regions = await this.regionRepository.find({
        where: {
          name: In(createCategoryDto.region_name),
        },
      });

      // Check if all requested regions were found
      if (regions.length !== createCategoryDto.region_name.length) {
        const missingRegionNames = createCategoryDto.region_name.filter(
          (name) => !regions.some((region) => region.name === name)
        );
        throw new NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
      }

      category.regions = regions; // Correctly assign an array of regions
    }

    category.name = createCategoryDto.name;
    category.slug = await this.convertToSlug(createCategoryDto.name);
    category.type = type;
    category.details = createCategoryDto.details;
    category.parent = null; // Set parent if required
    category.image = imageAttachment;
    category.icon = createCategoryDto.icon;
    category.language = createCategoryDto.language;

    const shop = await this.shopRepository.findOne({ where: { id: createCategoryDto.shop_id } });
    if (shop) {
      category.shop = shop;
    } else {
      throw new NotFoundException(`Shop with id '${createCategoryDto.shop_id}' not found`);
    }

    // Save the Category instance to the database
    return await this.categoryRepository.save(category);
  }

  async getCategories(query: GetCategoriesDto): Promise<CategoryPaginator> {
    const {
      limit = '10',
      page = '1',
      search,
      parent,
      shopSlug,
      shopId,
      language,
      orderBy = '',
      sortedBy = 'DESC',
      region_name,
      type,
    } = query;

    const numericPage = Number(page);
    const numericLimit = Number(limit);

    if (isNaN(numericPage) || isNaN(numericLimit)) {
      throw new BadRequestException('Page and limit values must be numbers');
    }

    const skip = (numericPage - 1) * numericLimit;
    const cacheKey = `categories-${numericPage}-${numericLimit}-${search || 'all'}-${parent || 'all'}-${shopSlug || 'all'}-${shopId || 'all'}-${language || 'all'}-${orderBy || 'none'}-${sortedBy || 'none'}-${region_name || 'all'}-${type || 'all'}`;

    let categories = await this.cacheManager.get<CategoryPaginator>(cacheKey);

    if (!categories) {
      const queryBuilder = this.categoryRepository.createQueryBuilder('category')
        .leftJoinAndSelect('category.type', 'type')
        .leftJoinAndSelect('category.image', 'image')
        .leftJoinAndSelect('category.subCategories', 'subCategories')
        .leftJoinAndSelect('category.shop', 'shop')
        .leftJoinAndSelect('category.regions', 'regions');

      // Apply search filter
      if (search) {
        queryBuilder.andWhere('category.name LIKE :search', { search: `%${search}%` });
      }

      // Apply shopSlug or shopId filter
      if (shopSlug) {
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
          throw new NotFoundException('Shop not found');
        }
        queryBuilder.andWhere('category.shopId = :shopId', { shopId: shop.id });
      } else if (shopId) {
        queryBuilder.andWhere('category.shopId = :shopId', { shopId });
      }

      // Apply parent category filter (commented out since no parentId column was defined)
      // if (parent && parent !== 'null') {
      //   queryBuilder.andWhere('category.parentId = :parentId', { parentId: parent }); // Ensure using parentId
      // } else if (parent === 'null') {
      //   queryBuilder.andWhere('category.parentId IS NULL'); // Ensure using parentId
      // }

      // Apply language filter
      if (language) {
        queryBuilder.andWhere('category.language = :language', { language });
      }

      // Apply region filter
      if (region_name) {
        const region = await this.regionRepository.findOne({ where: { name: region_name }, relations: ['categories'] });
        if (!region) {
          throw new NotFoundException('Region not found');
        }
        queryBuilder.andWhere('regions.id = :regionId', { regionId: region.id });
      }

      // Apply type filter
      if (type) {
        const typeEntity = await this.typeRepository.findOne({ where: { name: type } });
        if (!typeEntity) {
          throw new NotFoundException('Type not found');
        }
        queryBuilder.andWhere('category.typeId = :typeId', { typeId: typeEntity.id });
      }

      // Define valid values for sorting
      const validSortOrders: any[] = ['ASC', 'DESC'];

      // Create the sorting object
      const order = orderBy && sortedBy && validSortOrders.includes(sortedBy.toUpperCase() as any)
        ? { [orderBy]: sortedBy.toUpperCase() as any }
        : {};

      // Apply sorting if the order object is not empty
      if (Object.keys(order).length > 0) {
        queryBuilder.orderBy(`category.${orderBy}`, order[orderBy]);
      }

      // Apply pagination
      queryBuilder.skip(skip).take(numericLimit);

      // Execute query
      const [data, total] = await queryBuilder.getManyAndCount();

      // Create pagination result
      const queryParams = [
        search ? `search=${encodeURIComponent(search)}` : '',
        numericLimit ? `limit=${numericLimit}` : '',
        parent ? `parent=${parent}` : '',
        shopSlug ? `shopSlug=${encodeURIComponent(shopSlug)}` : '',
        shopId ? `shopId=${shopId}` : '',
        language ? `language=${language}` : '',
        region_name ? `region_name=${encodeURIComponent(region_name)}` : '',
        type ? `type=${type}` : '',
      ].filter(Boolean).join('&');

      const url = `/categories?${queryParams}`;
      categories = {
        data,
        ...paginate(total, numericPage, numericLimit, data.length, url),
      };

      // Cache the result for 1 hour
      await this.cacheManager.set(cacheKey, categories, 3600);
    }
    return categories;
  }


  async getCategory(param: string, language: string, shopId: number): Promise<Category> {
    const cacheKey = `category-${param}-${language}-${shopId}`;

    let category = await this.cacheManager.get<Category>(cacheKey);

    if (!category) {
      const queryBuilder = this.categoryRepository.createQueryBuilder('category')
        .leftJoinAndSelect('category.type', 'type')
        .leftJoinAndSelect('category.image', 'image')
        .leftJoinAndSelect('category.shop', 'shop')
        .where('category.language = :language', { language })
        .andWhere('category.shop = :shopId', { shopId });

      // Determine if param is an ID or slug
      const id = Number(param);
      if (!isNaN(id)) {
        queryBuilder.andWhere('category.id = :id', { id });
      } else {
        queryBuilder.andWhere('category.slug = :slug', { slug: param });
      }

      category = await queryBuilder.cache(50000).getOne();

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Cache the result for 1 hour
      await this.cacheManager.set(cacheKey, category, 3600);
    }

    return category;
  }


  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Fetch the existing category with necessary relations
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['type', 'image', 'regions', 'shop', 'parent'], // Include parent in relations
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Handle image update
    if (updateCategoryDto.image) {
      const image = await this.attachmentRepository.findOne({ where: { id: updateCategoryDto.image.id } });
      if (!image) {
        throw new NotFoundException(`Image with ID '${updateCategoryDto.image.id}' not found`);
      }

      // Remove old image if it exists and is only associated with this category
      if (category.image && (await this.categoryRepository.count({ where: { image: category.image } })) === 1) {
        await this.attachmentRepository.remove(category.image);
      }
      category.image = image;
    }

    // Handle type update
    if (updateCategoryDto.type_id) {
      const type = await this.typeRepository.findOne({ where: { id: updateCategoryDto.type_id } });
      if (!type) {
        throw new NotFoundException(`Type with ID '${updateCategoryDto.type_id}' not found`);
      }
      category.type = type;
    }

    // Handle parent update
    if (updateCategoryDto.parent) {
      const parentCategory = await this.categoryRepository.findOne({ where: { id: updateCategoryDto.parent.id } });
      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID '${updateCategoryDto.parent}' not found`);
      }
      category.parent = parentCategory;
    } else {
      category.parent = null; // Handle case where parent is not provided or should be set to null
    }

    // Handle regions update
    if (updateCategoryDto.region_name && updateCategoryDto.region_name.length > 0) {
      const regions = await this.regionRepository.find({
        where: { name: In(updateCategoryDto.region_name) },
      });

      // Check if all requested regions were found
      if (regions.length !== updateCategoryDto.region_name.length) {
        const missingRegionNames = updateCategoryDto.region_name.filter(
          (name) => !regions.some((region) => region.name === name)
        );
        throw new NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
      }

      category.regions = regions; // Correctly assign an array of regions
    }

    // Handle other updates
    category.name = updateCategoryDto.name || category.name; // Retain old value if not provided
    category.slug = updateCategoryDto.name ? await this.convertToSlug(updateCategoryDto.name) : category.slug; // Update slug if name is provided
    category.details = updateCategoryDto.details || category.details; // Retain old value if not provided
    category.icon = updateCategoryDto.icon || category.icon; // Retain old value if not provided
    category.language = updateCategoryDto.language || category.language; // Retain old value if not provided

    // Handle shop update if required
    if (updateCategoryDto.shop_id) {
      const shop = await this.shopRepository.findOne({ where: { id: updateCategoryDto.shop_id } });
      if (shop) {
        category.shop = shop;
      } else {
        throw new NotFoundException(`Shop with id '${updateCategoryDto.shop_id}' not found`);
      }
    }

    // Save and return the updated category
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
    if (createSubCategoryDto.image?.id) {
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

    // Handling regions
    if (createSubCategoryDto.regionName && createSubCategoryDto.regionName.length > 0) {
      const regions = await this.regionRepository.find({
        where: {
          name: In(createSubCategoryDto.regionName),
        },
      });

      // Check if all requested regions were found
      if (regions.length !== createSubCategoryDto.regionName.length) {
        const missingRegionNames = createSubCategoryDto.regionName.filter(
          (name) => !regions.some((region) => region.name === name)
        );
        throw new NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
      }

      subCategory.regions = regions; // Correctly assign an array of regions
    }

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
    const queryBuilder = this.subCategoryRepository.createQueryBuilder('subCategory')
      .leftJoinAndSelect('subCategory.image', 'image')
      .leftJoinAndSelect('subCategory.shop', 'shop')
      .leftJoinAndSelect('subCategory.category', 'category')
      .where('shop.slug = :shopSlug', { shopSlug });

    const id = Number(param);

    if (!isNaN(id)) {
      // If param is an ID
      queryBuilder.andWhere('subCategory.id = :id', { id });
    } else {
      // If param is a slug
      queryBuilder.andWhere('subCategory.slug = :slug', { slug: param })
        .andWhere('subCategory.language = :language', { language });
    }

    const subCategory = await queryBuilder.cache(50000).getOne();

    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }

    return subCategory;
  }


  async getSubCategories(query: GetSubCategoriesDto): Promise<SubCategoryPaginator> {
    const {
      limit = '10',
      page = '1',
      search,
      categoryId,
      shopSlug,
      regionName,
      orderBy = '',
      sortedBy = 'DESC',
    } = query;

    const numericPage = Number(page);
    const numericLimit = Number(limit);

    if (isNaN(numericPage) || isNaN(numericLimit)) {
      throw new BadRequestException('Page and limit values must be numbers');
    }

    const skip = (numericPage - 1) * numericLimit;
    const cacheKey = `subcategories-${numericPage}-${numericLimit}-${search || 'all'}-${categoryId || 'all'}-${shopSlug || 'all'}-${regionName || 'all'}-${orderBy || 'none'}-${sortedBy || 'none'}`;

    let subCategories = await this.cacheManager.get<SubCategoryPaginator>(cacheKey);

    if (!subCategories) {
      const queryBuilder = this.subCategoryRepository.createQueryBuilder('subCategory')
        .leftJoinAndSelect('subCategory.category', 'category')
        .leftJoinAndSelect('subCategory.image', 'image')
        .leftJoinAndSelect('subCategory.shop', 'shop')
        .leftJoinAndSelect('subCategory.regions', 'regions');

      // Apply search filter
      if (search) {
        queryBuilder.andWhere('subCategory.name LIKE :search', { search: `%${search}%` });
      }

      // Apply category filter
      if (categoryId) {
        queryBuilder.andWhere('category.id = :categoryId', { categoryId });
      }

      // Apply shopSlug filter
      if (shopSlug) {
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
          throw new NotFoundException('Shop not found');
        }
        queryBuilder.andWhere('shop.id = :shopId', { shopId: shop.id });
      }

      // Apply regionName filter
      if (regionName) {
        const region = await this.regionRepository.findOne({
          where: { name: regionName },
          relations: ['categories'],
        });
        if (!region) {
          throw new NotFoundException('Region not found');
        }
        queryBuilder.andWhere('regions.id = :regionId', { regionId: region.id });
      }

      // Apply sorting
      if (orderBy && sortedBy) {
        queryBuilder.orderBy(`subCategory.${orderBy}`, sortedBy.toUpperCase() as 'ASC' | 'DESC');
      }

      // Apply pagination
      const [data, total] = await queryBuilder
        .skip(skip)
        .take(numericLimit)
        .cache(50000)
        .getManyAndCount();

      const queryParams = [
        search ? `search=${encodeURIComponent(search)}` : '',
        numericLimit ? `limit=${numericLimit}` : '',
        categoryId ? `categoryId=${categoryId}` : '',
        shopSlug ? `shopSlug=${encodeURIComponent(shopSlug)}` : '',
        regionName ? `regionName=${encodeURIComponent(regionName)}` : '',
      ]
        .filter(Boolean)
        .join('&');

      const url = `/subcategories?${queryParams}`;

      subCategories = {
        data,
        ...paginate(total, numericPage, numericLimit, data.length, url),
      };

      await this.cacheManager.set(cacheKey, subCategories, 60); // Cache for 1 hour
    }

    return subCategories;
  }



  async updateSubCategory(id: number, updateSubCategoryDto: UpdateSubCategoryDto): Promise<SubCategory> {
    // Find the existing subcategory
    const subCategory = await this.subCategoryRepository.findOne({
      where: { id },
      relations: ['category', 'image', 'shop', 'regions'],
    });

    // Throw an error if the subcategory is not found
    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }

    // Update the image if provided
    if (updateSubCategoryDto.image) {
      const image = await this.attachmentRepository.findOne({ where: { id: updateSubCategoryDto.image.id } });
      if (!image) {
        throw new NotFoundException(`Image with ID '${updateSubCategoryDto.image.id}' not found`);
      }

      // If the current image is only used by this subcategory, remove it
      if (subCategory.image && (await this.subCategoryRepository.count({ where: { image: subCategory.image } })) === 1) {
        await this.attachmentRepository.remove(subCategory.image);
      }

      subCategory.image = image;
    }

    // Update the category if provided
    if (updateSubCategoryDto.category_id) {
      const category = await this.categoryRepository.findOne({ where: { id: updateSubCategoryDto.category_id } });
      if (!category) {
        throw new NotFoundException(`subCategory with ID '${updateSubCategoryDto.category_id}' not found`);
      }
      subCategory.category = category;
    }

    // Handling regions
    if (updateSubCategoryDto.regionName && updateSubCategoryDto.regionName.length > 0) {
      const regions = await this.regionRepository.find({
        where: {
          name: In(updateSubCategoryDto.regionName),
        },
      });

      // Check if all requested regions were found
      if (regions.length !== updateSubCategoryDto.regionName.length) {
        const missingRegionNames = updateSubCategoryDto.regionName.filter(
          (name) => !regions.some((region) => region.name === name)
        );
        throw new NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
      }

      subCategory.regions = regions; // Correctly assign an array of regions
    }

    // Update the remaining fields
    if (updateSubCategoryDto.name) {
      subCategory.name = updateSubCategoryDto.name;
      subCategory.slug = await this.convertToSlug(updateSubCategoryDto.name);
    }

    if (updateSubCategoryDto.details) {
      subCategory.details = updateSubCategoryDto.details;
    }

    if (updateSubCategoryDto.language) {
      subCategory.language = updateSubCategoryDto.language;
    }

    // Save the updated subcategory to the database
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

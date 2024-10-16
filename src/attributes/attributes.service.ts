/* eslint-disable prettier/prettier */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AttributeResponseDto, AttributeValueDto, CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { Attribute } from './entities/attribute.entity';
import { plainToClass } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { AttributeValue } from './entities/attribute-value.entity';
import { convertToSlug } from '../helpers';
import { GetAttributeArgs } from './dto/get-attribute.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Repository } from 'typeorm';
import { GetAttributesArgs } from './dto/get-attributes.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from '../helpers/cacheService';

@Injectable()
export class AttributesService {
  private readonly logger = new Logger(AttributesService.name);
  constructor(
    @InjectRepository(Attribute) private attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeValue) private attributeValueRepository: Repository<AttributeValue>,
    @InjectRepository(Shop) private shopRepository: Repository<Shop>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

  ) { }

  async convertToSlug(text) {
    return await convertToSlug(text);
  }

  getValueFromSearch(searchString: string, key: string): string | null {
    const regex = new RegExp(`${key}:(\\d+)`);
    const match = searchString.match(regex);
    return match ? match[1] : null;
  }

  async create(createAttributeDto: CreateAttributeDto): Promise<{ message: string; status: boolean } | Attribute> {
    // Check if the attribute exists
    const existingAttribute = await this.attributeRepository.findOne({
      where: { name: createAttributeDto.name, shop_id: createAttributeDto.shop_id },
      relations: ['values',
        'shop'
      ],
    });

    const shop = await this.shopRepository.findOne({ where: { id: Number(createAttributeDto.shop_id) } })
    // If the attribute does not exist, create a new attribute
    if (!existingAttribute) {
      const newAttribute = new Attribute();
      newAttribute.name = createAttributeDto.name;
      newAttribute.slug = await this.convertToSlug(createAttributeDto.name);
      newAttribute.shop_id = createAttributeDto.shop_id;
      newAttribute.shop = shop;
      newAttribute.language = createAttributeDto.language;

      const savedAttribute = await this.attributeRepository.save(newAttribute);
      const attributeValues = createAttributeDto.values.map((attributeValueDto) => {
        const attributeValue = new AttributeValue();
        attributeValue.attribute = savedAttribute;
        attributeValue.value = attributeValueDto.value;
        attributeValue.meta = attributeValueDto.meta;

        return attributeValue;
      });

      await this.attributeValueRepository.save(attributeValues);
      return savedAttribute;
    }
    // Otherwise, update the existing attribute values
    const existingAttributeValues = existingAttribute.values;
    for (const newAttributeValue of createAttributeDto.values) {
      const existingAttributeValue = existingAttributeValues.find((atValue) => atValue.value === newAttributeValue.value);
      if (existingAttributeValue) {
        existingAttributeValue.meta = newAttributeValue.meta;
      } else {
        const newAttributeValueEntity = new AttributeValue();
        newAttributeValueEntity.attribute = existingAttribute;
        newAttributeValueEntity.value = newAttributeValue.value;
        newAttributeValueEntity.meta = newAttributeValue.meta;
        existingAttributeValues.push(newAttributeValueEntity);
      }
    }
    await this.attributeValueRepository.save(existingAttributeValues);
    return existingAttribute;
  }

  async findAll(params: GetAttributesArgs): Promise<{
    id: number;
    name: string;
    slug: string;
    values: {
      id: number;
      value: string;
      meta?: string;
    }[];
  }[]> {
    const { search, orderBy, sortedBy, language, shopSlug, shop_id } = params;

    // Generate cache key based on parameters
    const cacheKey = `attributes:${JSON.stringify(params)}`;
    const cachedResult = await this.cacheManager.get<any[]>(cacheKey);
    if (cachedResult) {
      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    }

    // Start query
    const query = this.attributeRepository.createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.values', 'value') // Join with 'values'
      .leftJoinAndSelect('attribute.shop', 'shop'); // Join with 'shop'

    // Apply conditions
    if (shop_id) {
      query.andWhere('attribute.shop_id = :shop_id', { shop_id });
    }

    if (shopSlug) {
      query.andWhere('shop.slug = :shopSlug', { shopSlug });
    }

    if (language) {
      query.andWhere('attribute.language = :language', { language });
    }

    if (search) {
      query.andWhere(
        '(attribute.name LIKE :search OR value.value LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (orderBy && sortedBy) {
      query.orderBy(`attribute.${orderBy}`, sortedBy.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('attribute.created_at', 'DESC'); // Default sorting if none provided
    }

    // Fetch results
    const attributes = await query.getMany();

    // Format response
    const formattedAttributes = attributes.map(attribute => ({
      id: attribute.id,
      name: attribute.name,
      slug: attribute.slug,
      values: attribute.values.map(value => ({
        id: value.id,
        value: value.value,
        meta: value.meta,
      })),
    }));

    // Cache the result
    await this.cacheManager.set(cacheKey, formattedAttributes, 1800); // 30 minutes
    this.logger.log(`Data cached with key: ${cacheKey}`);

    return formattedAttributes;
  }

  async findOne(param: GetAttributeArgs): Promise<{ message: string } | Attribute | undefined> {
    // Generate a cache key
    const cacheKey = `attribute:${param.id || param.slug}`;
    const cachedResult = await this.cacheManager.get<Attribute | { message: string }>(cacheKey);

    if (cachedResult) {
      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    }

    // Create the query builder
    const query = this.attributeRepository.createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.values', 'value');

    // Add condition for id or slug
    if (param.id) {
      query.where('attribute.id = :id', { id: param.id });
    }

    if (param.slug) {
      query.orWhere('attribute.slug = :slug', { slug: param.slug });
    }

    // Fetch the attribute
    const result = await query.getOne();

    if (result) {
      // Cache found result for 60 minutes
      await this.cacheManager.set(cacheKey, result, 3600);
      this.logger.log(`Data cached with key: ${cacheKey}`);
      return result;
    } else {
      // Return not found message and cache it
      const notFoundMessage = { message: 'Attribute Not Found' };
      this.logger.log(`Data cached with key: ${cacheKey}`);
      return notFoundMessage;
    }
  }


  async update(id: number, updateAttributeDto: UpdateAttributeDto): Promise<{ message: string; status: boolean } | AttributeResponseDto> {
    // Check if the attribute exists
    const attribute = await this.attributeRepository.findOne({
      where: { id },
      relations: ['values'], // Load the attribute values
    });

    const shop = await this.shopRepository.findOne({ where: { id: Number(updateAttributeDto.shop_id) } });

    if (!attribute) {
      return {
        status: false,
        message: 'Attribute not found',
      };
    }

    // Update the attribute properties
    attribute.name = updateAttributeDto.name;
    attribute.slug = await this.convertToSlug(updateAttributeDto.name);
    attribute.shop_id = updateAttributeDto.shop_id;
    attribute.shop = shop;
    attribute.language = updateAttributeDto.language;

    // Map the updated attribute values to an array of values
    const updatedValues = updateAttributeDto.values.map((valueDto) => valueDto.value);

    // Filter out the attribute values that are not in the updated values
    const valuesToRemove = attribute.values.filter((value) => !updatedValues.includes(value.value));

    // Remove the attribute values from the database
    await this.attributeValueRepository.remove(valuesToRemove);

    // Add or update attribute values
    for (const updateAttributeValueDto of updateAttributeDto.values) {
      let attributeValue = attribute.values.find((atValue) => atValue.value === updateAttributeValueDto.value);

      if (!attributeValue) {
        // Create a new attribute value if it doesn't exist
        attributeValue = new AttributeValue();
        attributeValue.attribute = attribute; // Set the attribute reference
        attribute.values.push(attributeValue);
      }

      // Update the attribute value
      attributeValue.value = updateAttributeValueDto.value;
      attributeValue.meta = updateAttributeValueDto.meta;

      // Save the attribute value
      await this.attributeValueRepository.save(attributeValue);
    }

    // Update the attribute in the database
    await this.attributeRepository.save(attribute);

    // Construct response DTO
    const responseDto: AttributeResponseDto = {
      id: attribute.id,
      name: attribute.name,
      slug: attribute.slug,
      shop_id: parseInt(attribute.shop_id),
      language: attribute.language,
      values: attribute.values.map((value) => ({ value: value.value, meta: value.meta })), // Avoid circular references
    };

    return responseDto; // Return the DTO
  }

  async delete(id: number) {
    // Get the attribute with the specified ID, including all of the associated attribute values.
    const attribute = await this.attributeRepository.findOne({
      where: { id },
      relations: ['values'],
    });

    // If the attribute is not found, throw an error.
    if (!attribute) {
      throw new Error(`Attribute with ID ${id} not found`);
    }

    // Delete all of the attribute values associated with the attribute.
    await Promise.all(
      attribute.values.map(async (attributeValue) => {
        await this.attributeValueRepository.delete(attributeValue.id);
      }),
    );

    // Delete the attribute.
    await this.attributeRepository.delete(attribute.id);
  }

}
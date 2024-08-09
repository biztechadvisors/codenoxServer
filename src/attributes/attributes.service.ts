/* eslint-disable prettier/prettier */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AttributeValueDto, CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { Attribute } from './entities/attribute.entity';
import { plainToClass } from 'class-transformer';
import { AttributeRepository, AttributeValueRepository } from './attribute.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AttributeValue } from './entities/attribute-value.entity';
import { convertToSlug } from '../helpers';
import { GetAttributeArgs } from './dto/get-attribute.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Repository } from 'typeorm';
import { GetAttributesArgs } from './dto/get-attributes.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AttributesService {
  private readonly logger = new Logger(AttributesService.name);
  constructor(
    @InjectRepository(AttributeRepository) private attributeRepository: AttributeRepository,
    @InjectRepository(AttributeValueRepository) private attributeValueRepository: AttributeValueRepository,
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
      language?: string;
    }[];
  }[]> {
    const { search, orderBy, sortedBy, language, shopSlug, shop_id } = params;

    // Generate a cache key based on the parameters
    const cacheKey = `attributes:${JSON.stringify(params)}`;
    const cachedResult = await this.cacheManager.get<any[]>(cacheKey);

    if (cachedResult) {
      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    }

    const query = this.attributeRepository.createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.values', 'value')
      .leftJoinAndSelect('attribute.shop', 'shop');

    if (shop_id) {
      query.where('attribute.shop_id = :shop_id', { shop_id });
    } else if (shopSlug) {
      query.where('shop.slug = :shopSlug', { shopSlug });
    }

    if (language) {
      query.andWhere('attribute.language = :language', { language });
    }

    if (search) {
      query.andWhere('attribute.name LIKE :search', { search: `%${search}%` });
    }

    if (orderBy && sortedBy) {
      query.orderBy(`attribute.${orderBy}`, sortedBy.toUpperCase() as 'ASC' | 'DESC');
    }

    const attributes = await query.getMany();

    const formattedAttributes = attributes.map((attribute) => {
      return {
        id: attribute.id,
        name: attribute.name,
        slug: attribute.slug,
        values: attribute.values.map((value) => ({
          id: value.id,
          value: value.value,
          meta: value.meta,
        })),
      };
    });

    // Cache the result for future requests
    await this.cacheManager.set(cacheKey, formattedAttributes, 1800); // Cache for 30 minutes
    this.logger.log(`Data cached with key: ${cacheKey}`);

    return formattedAttributes;
  }


  async findOne(param: GetAttributeArgs): Promise<{ message: string } | Attribute | undefined> {
    // Generate a cache key based on the parameters
    const cacheKey = `attribute:${param.id || param.slug}`;
    const cachedResult = await this.cacheManager.get<Attribute | { message: string }>(cacheKey);

    if (cachedResult) {
      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    }

    const result = await this.attributeRepository.findOne({
      where: [
        { id: param.id },
        { slug: param.slug },
      ],
      relations: ['values'],
    });

    if (result) {
      // Cache the found attribute
      await this.cacheManager.set(cacheKey, result, 1800); // Cache for 30 minutes
      this.logger.log(`Data cached with key: ${cacheKey}`);
      return result;
    } else {
      const notFoundMessage = { message: "Attribute Not Found" };
      // Cache the not found message to avoid repeated DB hits for the same query
      await this.cacheManager.set(cacheKey, notFoundMessage, 1800);
      this.logger.log(`Data cached with key: ${cacheKey}`);
      return notFoundMessage;
    }
  }


  async update(id: number, updateAttributeDto: UpdateAttributeDto): Promise<{ message: string; status: boolean } | Attribute> {
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

    // Update the attribute values
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

    return attribute;
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
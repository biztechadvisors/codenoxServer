/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AttributeValueDto, CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import attributesJson from '@db/attributes.json';
import { Attribute } from './entities/attribute.entity';
import { plainToClass } from 'class-transformer';
import { AttributeRepository, AttributeValueRepository } from './attribute.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AttributeValue } from './entities/attribute-value.entity';
import { convertToSlug } from '../helpers';
import { GetAttributeArgs } from './dto/get-attribute.dto';
const attributes = plainToClass(Attribute, attributesJson);

@Injectable()
export class AttributesService {
  private attributes: Attribute[] = attributes;
  constructor(
    @InjectRepository(AttributeRepository) private attributeRepository: AttributeRepository,
    @InjectRepository(AttributeValueRepository) private attributeValueRepository: AttributeValueRepository,
  ) { }

  async convertToSlug(text) {
    return await convertToSlug(text);
  }

  async create(createAttributeDto: CreateAttributeDto): Promise<{ message: string; status: boolean } | Attribute> {
    // Check if the attribute exists
    const existingAttribute = await this.attributeRepository.findOne({
      where: { name: createAttributeDto.name, shop_id: createAttributeDto.shop_id },
      relations: ['values',
        // 'shop'
      ],
    });

    // If the attribute does not exist, create a new attribute
    if (!existingAttribute) {
      const newAttribute = new Attribute();
      newAttribute.name = createAttributeDto.name;
      newAttribute.slug = await this.convertToSlug(createAttributeDto.name);
      newAttribute.shop_id = createAttributeDto.shop_id;
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
    console.log("existingAttribute", existingAttribute)
    for (const newAttributeValue of createAttributeDto.values) {
      console.log("newAttributeValues", newAttributeValue)
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

  async findAll(): Promise<{
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
    const attributes = await this.attributeRepository.find({
      relations: ['values',
        // 'shop'
      ],
    });

    return attributes.map((attribute) => {
      return {
        id: attribute.id,
        name: attribute.name,
        slug: attribute.slug,
        shop_id: attribute.shop_id,
        language: attribute.language,
        created_at: attribute.created_at,
        updated_at: attribute.updated_at,
        values: attribute.values.map((attributeValue) => {
          return {
            id: attributeValue.id,
            value: attributeValue.value,
            meta: attributeValue.meta,
            attributeId: attributes[0].id,
            language: attribute.language,
            created_at: attribute.created_at,
            updated_at: attribute.updated_at,
          };
        }),
        // shop: {
        //   id: attribute.shop.id,
        //   name: attribute.shop.name,
        // },
      };
    });
  }


  // findOne(param: string) {
  //   return this.attributes.find(
  //     (p) => p.id === Number(param) || p.slug === param,
  //   );
  // }

  async findOne(param: GetAttributeArgs): Promise<{ message: string } | Attribute | undefined> {
    console.log("testing?")
    const result = await this.attributeRepository.findOne({
      where: [
        { id: param.id },
        { slug: param.slug },
      ],
      relations: ['values',
        // 'shop'
      ]
    });

    if (result) {
      return result;
    } else {
      return {
        message: "Attribute Not Found"
      }
    }
  }

  async update(id: number, updateAttributeDto: UpdateAttributeDto): Promise<{ message: string; status: boolean } | Attribute> {
    // Check if the attribute exists
    const attribute = await this.attributeRepository.findOne({
      where: { id },
    });
  
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
    attribute.language = updateAttributeDto.language;
  
    // Check for existing attribute values before saving
    const existingAttributeValues = await this.attributeValueRepository.find({
      where: { attribute: { id: attribute.id } }, // Use the attribute's ID to filter attribute values
    });
  
    const updatedAttributeValues = [];
  
    for (const updateAttributeValueDto of updateAttributeDto.values) {
      const existingAttributeValue = existingAttributeValues.find((atValue) => atValue.value === updateAttributeValueDto.value);
  
      if (!existingAttributeValue) {
        // Create a new attribute value if it doesn't exist
        const newAttributeValue = new AttributeValue();
        newAttributeValue.attribute = attribute; // Set the attribute reference
        newAttributeValue.value = updateAttributeValueDto.value;
        newAttributeValue.meta = updateAttributeValueDto.meta;
        updatedAttributeValues.push(newAttributeValue);
      }
    }
  
    // Update the attribute and attribute values in the database
    await this.attributeRepository.save(attribute);
    await this.attributeValueRepository.save(updatedAttributeValues);
  
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

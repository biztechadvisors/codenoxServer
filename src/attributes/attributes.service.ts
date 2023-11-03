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
    const existingAttribute = await this.attributeRepository.find({
      where: { name: createAttributeDto.name, shop_id: createAttributeDto.shop_id },
    });

    if (existingAttribute && existingAttribute.length > 0) {
      // Save the attribute values to the existing attribute
      const attributeValues = createAttributeDto.values.map((attributeValueDto) => {
        const attributeValue = new AttributeValue();
        attributeValue.attribute = existingAttribute[0];
        attributeValue.value = attributeValueDto.value;
        attributeValue.meta = attributeValueDto.meta;

        return attributeValue;
      });

      await this.attributeValueRepository.save(attributeValues);

      return {
        status: true,
        message: 'Inserted Succesfully',
      };
    } else {
      // Create a new attribute and save the attribute values
      try {
        const attribute = new Attribute();
        attribute.name = createAttributeDto.name;
        attribute.slug = await this.convertToSlug(createAttributeDto.name);
        attribute.shop_id = createAttributeDto.shop_id;
        attribute.language = createAttributeDto.language;

        const savedAttribute = await this.attributeRepository.save(attribute);

        const attributeValues = createAttributeDto.values.map((attributeValueDto) => {
          const attributeValue = new AttributeValue();
          attributeValue.attribute = savedAttribute;
          attributeValue.value = attributeValueDto.value;
          attributeValue.meta = attributeValueDto.meta;

          return attributeValue;
        });

        await this.attributeValueRepository.save(attributeValues);

        return savedAttribute;
      } catch (error) {
        console.error(error);
        return {
          status: false,
          message: 'Error creating attribute: ' + error.message,
        };
      }
    }
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
        message: 'Attribute Not Found',
      };
    }

    // Update the attribute values
    attribute.name = updateAttributeDto.name;
    attribute.slug = await this.convertToSlug(updateAttributeDto.name);
    attribute.shop_id = updateAttributeDto.shop_id;
    attribute.language = updateAttributeDto.language;

    // Update the attribute in the database
    await this.attributeRepository.save(attribute);

    // Update the attribute values in the database
    const attributeValues = updateAttributeDto.values.map((attributeValueDto) => {
      const attributeValue = new AttributeValue();
      attributeValue.attribute = attribute;
      attributeValue.value = attributeValueDto.value;
      attributeValue.meta = attributeValueDto.meta;

      return attributeValue;
    });

    await this.attributeValueRepository.save(attributeValues);

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

/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { Attribute } from './entities/attribute.entity';
import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator';
import { AttributeValue } from './entities/attribute-value.entity';

@CustomRepository(Attribute)
export class AttributeRepository extends Repository<Attribute> { }

@CustomRepository(AttributeValue)
export class AttributeValueRepository extends Repository<AttributeValue> { }

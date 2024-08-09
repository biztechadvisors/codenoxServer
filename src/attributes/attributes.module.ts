import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { AttributeRepository, AttributeValueRepository } from './attribute.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([AttributeRepository, AttributeValueRepository]),
  TypeOrmModule.forFeature([Attribute, Shop]),
  CacheModule.register()],
  controllers: [AttributesController],
  providers: [AttributesService],
})
export class AttributesModule { }
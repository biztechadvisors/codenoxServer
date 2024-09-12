import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { AttributeValue } from './entities/attribute-value.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attribute, Shop, AttributeValue]),
    CacheModule.register()],
  controllers: [AttributesController],
  providers: [AttributesService],
})
export class AttributesModule { }
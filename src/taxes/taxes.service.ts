/* eslint-disable prettier/prettier */
import { All, Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax } from './entities/tax.entity';
import taxesJson from '@db/taxes.json';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { ProductRepository } from 'src/products/products.repository';
import { Category } from 'src/categories/entities/category.entity';
import { CategoryRepository } from 'src/categories/categories.repository';
// import {gstinValidator } from 'gstin-validator';
import { stateCode } from './state_code.tax';
import { Shop } from 'src/shops/entities/shop.entity';

export enum GST_NAME {
  GOODS = 'goods',
  SERVICES = 'service'
}

const taxes = plainToClass(Tax, taxesJson);

@Injectable()
export class TaxesService {
  private taxes: Tax[] = taxes;
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: CategoryRepository,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>
  ) { }

  async create(createTaxDto: CreateTaxDto) {
    try {
      let gst: number | null = null;
      let shop: any = null;
      const tax = new Tax();

      if (createTaxDto.shop_id) {
        shop = await this.shopRepository.findOne({ where: { id: createTaxDto.shop_id } });
        if (!shop) {
          throw new NotFoundException(`Shop with ID ${createTaxDto.shop_id} not found`);
        }
      }

      if (createTaxDto.rate) {
        gst = createTaxDto.rate / 2;
      }

      tax.name = createTaxDto.name;

      // Ensure only one of sac_no or hsn_no is set, the other is null
      if (createTaxDto.sac_no) {
        tax.sac_no = createTaxDto.sac_no;
        tax.gst_Name = GST_NAME.GOODS;
        tax.hsn_no = null;
      } else if (createTaxDto.hsn_no) {
        tax.hsn_no = createTaxDto.hsn_no;
        tax.gst_Name = GST_NAME.SERVICES;
        tax.sac_no = null;
      }

      tax.shop = shop;
      tax.cgst = gst !== null ? gst : createTaxDto.cgst;
      tax.sgst = gst !== null ? gst : createTaxDto.sgst;
      tax.compensation_Cess = createTaxDto.compensation_Cess;
      tax.rate = createTaxDto.rate;  // IGST

      return await this.taxRepository.save(tax);
    } catch (error) {
      console.error('Error creating tax:', error);
      return 'Cannot Find Data Here';
    }
  }

  async findAllByShopIdentifier(shopId: number, shopSlug: string): Promise<Tax[]> {
    try {
      let existingData;

      if (shopId) {
        existingData = await this.taxRepository.find({
          where: { shop: { id: shopId } },
          relations: ['shop']
        });
      } else if (shopSlug) {
        existingData = await this.taxRepository.find({
          where: { shop: { slug: shopSlug } },
          relations: ['shop']
        });
      }

      return existingData ? existingData : [];
    } catch (error) {
      console.error("Error retrieving tax data:", error);
      throw new NotFoundException("Failed to retrieve tax data");
    }
  }

  async findOne(id: number) {
    try {
      const existingTax = await this.taxRepository.findOne({ where: { id: id } });
      if (existingTax) {
        return existingTax
      } else {
        return { message: 'Cannot find TaxRate' }
      }
    } catch {
      return 'Cannot Find Data Here'
    }
  }

  async update(id: number, updateTaxDto: UpdateTaxDto) {
    try {

      const existingTaxes = await this.taxRepository.findOne({
        where: { id: id },
      });

      if (!existingTaxes) {
        throw new NotFoundException('Tax not found');
      }

      let gst: number | null = null;

      if (updateTaxDto.rate) {
        gst = updateTaxDto.rate / 2;
      }

      existingTaxes.name = updateTaxDto.name;

      // Ensure only one of sac_no or hsn_no is set, the other is null
      if (updateTaxDto.sac_no) {
        existingTaxes.sac_no = updateTaxDto.sac_no;
        existingTaxes.gst_Name = GST_NAME.SERVICES;
        existingTaxes.hsn_no = null;
      } else if (updateTaxDto.hsn_no) {
        existingTaxes.hsn_no = updateTaxDto.hsn_no;
        existingTaxes.gst_Name = GST_NAME.GOODS;
        existingTaxes.sac_no = null;
      }

      existingTaxes.cgst = gst !== null ? gst : updateTaxDto.cgst;
      existingTaxes.sgst = gst !== null ? gst : updateTaxDto.sgst;

      existingTaxes.compensation_Cess = updateTaxDto.compensation_Cess;
      existingTaxes.rate = updateTaxDto.rate;

      return await this.taxRepository.save(existingTaxes);
    } catch (error) {
      console.error('Error updating tax:', error);
      return 'Updated unsuccessfully';
    }
  }

  async remove(id: number) {
    const existingTaxes = await this.taxRepository.findOne({
      where: { id: id }
    })

    if (!existingTaxes) {
      throw new NotFoundException('Question not found');
    }
    return this.taxRepository.remove(existingTaxes);
  }


  async validateGST(gstNumber: string) {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    const isValidGST = gstRegex.test(gstNumber);
    return isValidGST;
  }
}

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
    private readonly categoryRepository: CategoryRepository
  ) { }

  async create(createTaxDto: CreateTaxDto) {
    try {
      let gst: any
      const tax = new Tax()
      if (createTaxDto.rate) {
        gst = createTaxDto.rate / 2
      }

      tax.name = createTaxDto.name
      if (createTaxDto.sac_no != null) {
        tax.sac_no = createTaxDto.sac_no
      } else {
        tax.hsn_no = createTaxDto.hsn_no
      }
      tax.cgst = gst ? gst : createTaxDto.cgst
      tax.sgst = gst ? gst : createTaxDto.sgst
      tax.gst_Name = createTaxDto.gst_Name
      tax.compensation_Cess = createTaxDto.compensation_Cess
      tax.rate = createTaxDto.rate  // IGST
      return await this.taxRepository.save(tax)
    } catch {
      return 'Cannot Find Data Here'
    }
  }

  async findAll() {
    const existingData = await this.taxRepository.find();
    return existingData;
  }


  async findOnePro(id: number, proId: number) {
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
        where: { id: id }
      })
      let gst

      if (!existingTaxes) {
        throw new NotFoundException('Question not found');
      }
      if (updateTaxDto.rate) {
        gst = updateTaxDto.rate / 2
      }
      existingTaxes.name = updateTaxDto.name
      if (existingTaxes.sac_no != null) {
        existingTaxes.sac_no = updateTaxDto.sac_no
      } else {
        existingTaxes.hsn_no = updateTaxDto.hsn_no
      }
      existingTaxes.cgst = gst ? gst : updateTaxDto.cgst
      existingTaxes.sgst = gst ? gst : updateTaxDto.sgst
      const GST = updateTaxDto.gst_Name ? updateTaxDto.gst_Name : GST_NAME.GOODS
      switch (GST) {
        case GST_NAME.GOODS:
          existingTaxes.gst_Name = GST_NAME.GOODS
          break;
        case GST_NAME.SERVICES:
          existingTaxes.gst_Name = GST_NAME.SERVICES
        default:
          break;
      }
      existingTaxes.gst_Name = GST
      existingTaxes.compensation_Cess = updateTaxDto.compensation_Cess
      existingTaxes.rate = updateTaxDto.rate

      return this.taxRepository.save(existingTaxes);
    } catch {
      return 'Updated unSuccessfully'
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

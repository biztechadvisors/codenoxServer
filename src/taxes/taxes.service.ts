/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax } from './entities/tax.entity';
import taxesJson from '@db/taxes.json';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';

const taxes = plainToClass(Tax, taxesJson);

@Injectable()
export class TaxesService {
  private taxes: Tax[] = taxes;
constructor(  @InjectRepository(Tax)
private readonly taxRepository:Repository<Tax>){}

  async create(createTaxDto: CreateTaxDto) {
    const tax = new Tax()
    tax.name = createTaxDto.name
    tax.on_shipping = createTaxDto.on_shipping
    tax.city = createTaxDto.city
    tax.zip = createTaxDto.zip
    tax.is_global = createTaxDto.is_global
    tax.priority = createTaxDto.priority
    tax.rate = createTaxDto.rate
    tax.state = createTaxDto.state
    tax.country = createTaxDto.country
    tax.product = createTaxDto.product

    return await this.taxRepository.save(tax)
  }

  async findAll() {
    const existingData = await this.taxRepository.find({relations:['product']});
    // return existingData
    const AllTaxes = []
    for(const tax of existingData){
    
      const{name, rate, is_global, country,state,zip, city,priority,on_shipping,product} = tax

        const Tax = product.price*rate/100 
        const taxesAfterDeduct =  product.sale_price + Tax
        const taxResult = {
          totalBeforePrice:product? product.sale_price:null,
          tax:Tax,
          withTax:taxesAfterDeduct,
          // totalPrice:product? product.price:null,
          is_global:is_global,
          rate: rate,
          Category: name,
          on_shipping: on_shipping,
          country: country,
          state:state,
          zip:zip,
          city:city,
          priority:priority,
          name:is_global?"Product":"category"
        }

        AllTaxes.push(taxResult)
    }
    return AllTaxes
  }

  async findOne(id: number) {
    const existingTax =  await this.taxRepository.findOne({where:{id:id}, relations:['product']});
    if(existingTax){
    console.log(existingTax)
    const{name, rate, is_global, country,state,zip, city,priority,on_shipping,product} = existingTax
      const Tax = product.price*rate/100 
      const taxesAfterDeduct =  product.sale_price + Tax
      const taxResult = {
        totalBeforePrice:product? product.sale_price:null,
        tax:Tax,
        withTax:taxesAfterDeduct,
        is_global:is_global,

        // totalPrice:product? product.price:null,
        rate: rate,
        Category: name,
        on_shipping: on_shipping,
        country: country,
        state:state,
        zip:zip,
        city:city,
        priority:priority,
        name:is_global?"Product":"category"
      }
      return taxResult
    }
  }

  async update(id: number, updateTaxDto: UpdateTaxDto) {
    const existingTaxes  = await this.taxRepository.findOne({
      where:{id:id}
    })

    if(!existingTaxes){
      throw new NotFoundException('Question not found'); 
    }
    existingTaxes.city = updateTaxDto.city
    existingTaxes.country= updateTaxDto.country
    existingTaxes.is_global = updateTaxDto.is_global
    existingTaxes.name = updateTaxDto.name
    existingTaxes.on_shipping = updateTaxDto.on_shipping
    existingTaxes.priority = updateTaxDto.priority
    existingTaxes.rate = updateTaxDto.rate
    existingTaxes.state = updateTaxDto.state
    existingTaxes.zip = updateTaxDto.zip

    return this.taxRepository.save(existingTaxes);
  }

  async remove(id: number) {
    const existingTaxes = await this.taxRepository.findOne({
      where:{id:id}
    })

    if(!existingTaxes){
      throw new NotFoundException('Question not found');
    }
    return this.taxRepository.remove(existingTaxes);
  }
}

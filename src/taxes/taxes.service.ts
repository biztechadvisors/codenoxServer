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

const taxes = plainToClass(Tax, taxesJson);

@Injectable()
export class TaxesService {
  private taxes: Tax[] = taxes;
constructor(  
@InjectRepository(Tax)
private readonly taxRepository:Repository<Tax>,
@InjectRepository(Product)
private readonly productRepository:Repository<Product>,
@InjectRepository(Category)
private readonly categoryRepository:CategoryRepository
){}

  async create(createTaxDto: CreateTaxDto) {
    try{
    const tax = new Tax()
    if(createTaxDto.product){
      tax.product = createTaxDto.product
    }else if(createTaxDto.category){
      tax.category = createTaxDto.category
    }else{
      console.log('No Product and Category is Here')
    }

    tax.name = createTaxDto.name
    tax.on_shipping = createTaxDto.on_shipping
    tax.city = createTaxDto.city
    tax.zip = createTaxDto.zip
    tax.is_global = createTaxDto.is_global
    tax.priority = createTaxDto.priority
    tax.rate = createTaxDto.rate
    tax.state = createTaxDto.state
    tax.country = createTaxDto.country

    return await this.taxRepository.save(tax)
  }catch{
    return 'Cannot Find Data Here'
  }
  }

  async findAll() {
    const existingData = await this.taxRepository.find({ relations: ['product', 'product.categories', 'category', 'category.products'] });
    const AllTaxes = [];
  
    for (const tax of existingData) {
      const { id, name, rate, is_global, country, state, zip, city, priority, on_shipping, product, category } = tax;
  
      if (product && Array.isArray(product)) {
        for (const individualProduct of product) {
          const { id: productId, name: productName, slug, price, sale_price, type_id, product_type, shop_id, description } = individualProduct;
          const tax = price * rate / 100;
          const taxesAfterDeduct = sale_price + tax;
  
          const taxResult = {
            id:id,
            productId :productId,
            totalBeforePrice: sale_price,
            tax: tax,
            withTax: taxesAfterDeduct,
            totalPrice: price,
            is_global: is_global,
            rate: rate,
            Category: name,
            on_shipping: on_shipping,
            country: country,
            state: state,
            zip: zip,
            city: city,
            priority: priority,
            name: "Product"
          };
  
          AllTaxes.push(taxResult);
        }
      }
  
      if (category && Array.isArray(category)) {
        for (const individualCategory of category) {
          if (individualCategory.products && Array.isArray(individualCategory.products)) {
            for (const categoryProduct of individualCategory.products) {
              const { id: productId, name: productName, slug, price, sale_price, type_id, product_type, shop_id, description } = categoryProduct;
              const tax = price * rate / 100;
              const taxesAfterDeduct = sale_price + tax;
  
              const taxResult = {
                id:id,
                productId :productId,
                category:individualCategory.id,
                totalBeforePrice: sale_price,
                tax: tax,
                withTax: taxesAfterDeduct,
                totalPrice: price,
                is_global: is_global,
                rate: rate,
                Category: name,
                on_shipping: on_shipping,
                country: country,
                state: state,
                zip: zip,
                city: city,
                priority: priority,
                name: "Category"
              };
  
              AllTaxes.push(taxResult);
            }
          }
        }
      }
    }
  
    // Return AllTaxes to the client side
    return AllTaxes;
  }


  async findOnePro(id: number, proId: number) {
    try{
    const existingTax = await this.taxRepository.findOne({ where: { id: id }, relations: ['product', 'category.products'] });
  
    if (existingTax) {
      const { name, rate, is_global, country, state, zip, city, priority, on_shipping, product, category } = existingTax;
      // const AllTaxes = [];
  
      if (product && Array.isArray(product)) {
        for (const individualProduct of product) {
          const { id: productId, name: productName, slug, price, sale_price, type_id, product_type, shop_id, description } = individualProduct;
  
          if (productId === proId) {
            console.log("Product is available");
            const tax = price * rate / 100;
            const taxesAfterDeduct = sale_price + tax;
  
            const taxResult = {
              id: id,
              productId: productId,
              totalBeforePrice: sale_price,
              tax: tax,
              withTax: taxesAfterDeduct,
              totalPrice: price,
              is_global: is_global,
              rate: rate,
              Category: name,
              on_shipping: on_shipping,
              country: country,
              state: state,
              zip: zip,
              city: city,
              priority: priority,
              name: "Product"
            };
  
            return taxResult; // Return the taxResult when a match is found
          }
        }
      }
  
      if (category && Array.isArray(category)) {
        for (const individualCategory of category) {
          if (individualCategory.products && Array.isArray(individualCategory.products)) {
            for (const categoryProduct of individualCategory.products) {
              const { id: productId, name: productName, slug, price, sale_price, type_id, product_type, shop_id, description } = categoryProduct;
  
              if (individualCategory.id === proId) {
                console.log("Product is available in the category");
                const tax = price * rate / 100;
                const taxesAfterDeduct = sale_price + tax;
  
                const taxResult = {
                  id: id,
                  productId: productId,
                  category: individualCategory.id,
                  totalBeforePrice: sale_price,
                  tax: tax,
                  withTax: taxesAfterDeduct,
                  totalPrice: price,
                  is_global: is_global,
                  rate: rate,
                  Category: name,
                  on_shipping: on_shipping,
                  country: country,
                  state: state,
                  zip: zip,
                  city: city,
                  priority: priority,
                  name: "Category"
                };
  
                return taxResult; // Return the taxResult when a match is found
              }
            }
          }
        }
      }
    }
  }catch{
    return 'Cannot Find Data Here'
  }
  }
  

  async findOne(id: number) {
    try{
    const existingTax = await this.taxRepository.findOne({ where: { id: id }, relations: ['product', 'category.products'] });
  
    if (existingTax) {
      console.log(existingTax);
      const { name, rate, is_global, country, state, zip, city, priority, on_shipping, product, category } = existingTax;
      const AllTaxes = [];
  
      if (product && Array.isArray(product)) {
        for (const individualProduct of product) {
          const { id: productId, name: productName, slug, price, sale_price, type_id, product_type, shop_id, description } = individualProduct;
          const tax = price * rate / 100;
          const CGST = tax/2
          const SGST = tax/2
          const taxesAfterDeduct = sale_price + tax;
  
          const taxResult = {
            id: id,
            productId: productId,
            totalBeforePrice: sale_price,
            cgst: CGST,
            sgst: SGST,
            withTax: taxesAfterDeduct,
            totalPrice: price,
            is_global: is_global,
            rate: rate,
            Category: name,
            on_shipping: on_shipping,
            country: country,
            state: state,
            zip: zip,
            city: city,
            priority: priority,
            name: "Product"
          };
  
          AllTaxes.push(taxResult);
        }
      }
  
      if (category && Array.isArray(category)) {
        for (const individualCategory of category) {
          if (individualCategory.products && Array.isArray(individualCategory.products)) {
            for (const categoryProduct of individualCategory.products) {
              const { id: productId, name: productName, slug, price, sale_price, type_id, product_type, shop_id, description } = categoryProduct;
              const tax = price * rate / 100;
              const CGST = tax/2
              const SGST = tax/2
              const taxesAfterDeduct = sale_price + tax;
  
              const taxResult = {
                id: id,
                productId: productId,
                category: individualCategory.id,
                totalBeforePrice: sale_price,
                // tax: tax,
                cgst: CGST,
                sgst: SGST,
                withTax: taxesAfterDeduct,
                totalPrice: price,
                is_global: is_global,
                rate: rate,
                Category: name,
                on_shipping: on_shipping,
                country: country,
                state: state,
                zip: zip,
                city: city,
                priority: priority,
                name: "Category"
              };
  
              AllTaxes.push(taxResult);
            }
          }
        }
      }
      return AllTaxes;
    }
  }catch{
    return 'Cannot Find Data Here'
  }
  }
  

  async update(id: number, updateTaxDto: UpdateTaxDto) {
    try{
    const existingTaxes  = await this.taxRepository.findOne({
      where:{id:id}
    })

    if(!existingTaxes){
      throw new NotFoundException('Question not found'); 
    }
    if(updateTaxDto.product){
      existingTaxes.product = updateTaxDto.product
    }else if(updateTaxDto.category){
      existingTaxes.category = updateTaxDto.category
    }else{
      console.log('No Product and Category is Here')
    }

    existingTaxes.name = updateTaxDto.name
    existingTaxes.on_shipping = updateTaxDto.on_shipping
    existingTaxes.city = updateTaxDto.city
    existingTaxes.zip = updateTaxDto.zip
    existingTaxes.is_global = updateTaxDto.is_global
    existingTaxes.priority = updateTaxDto.priority
    existingTaxes.rate = updateTaxDto.rate
    existingTaxes.state = updateTaxDto.state
    existingTaxes.country = updateTaxDto.country
    

    return this.taxRepository.save(existingTaxes);
  }catch{
    return 'Updated unSuccessfully'
  }
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


  async validateGST(gstNumber: string){
    console.log(gstNumber)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    const isValidGST = gstRegex.test(gstNumber);
    console.log(isValidGST)

  return isValidGST;
    // const isValid = gstinValidator.isvalid(gstNumber)
    // return { isValid, message: isValid ? 'GST number is valid.' : 'Invalid GST number.' };

  }
}

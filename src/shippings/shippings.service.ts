/* eslint-disable prettier/prettier */
<<<<<<< HEAD
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { GetShippingsDto } from './dto/get-shippings.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { Shipping } from './entities/shipping.entity';
import shippingsJson from '@db/shippings.json';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
=======
import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateShippingDto } from './dto/create-shipping.dto'
import { GetShippingsDto } from './dto/get-shippings.dto'
import { UpdateShippingDto } from './dto/update-shipping.dto'
import { Shipping } from './entities/shipping.entity'
import shippingsJson from '@db/shippings.json'
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

const shippings = plainToClass(Shipping, shippingsJson)

@Injectable()
export class ShippingsService {
<<<<<<< HEAD
  private shippings: Shipping[] = shippings;
  constructor(
    @InjectRepository(Shipping)
    private readonly shippingRepository:Repository<Shipping>

  ){}

  async create(createShippingDto: CreateShippingDto) {
    const shipping = new Shipping()
    shipping.name = createShippingDto.name
    shipping.amount = createShippingDto.amount
    shipping.type = createShippingDto.type
    shipping.is_global = createShippingDto.is_global

    return await this.shippingRepository.save(shipping)
  }

  async getShippings() {
    const shippingFind =  await this.shippingRepository.find()
    return shippingFind
    // return this.shippings;
  }

  findOne(id: number) {
    return this.shippingRepository.find({where :{id}});
  }

  async update(id: number, updateShippingDto: UpdateShippingDto) {
    const existingShipping = await this.shippingRepository.findOne({where:{id}})

    if(!existingShipping){
      throw new NotFoundException('Address not found');
    }

    existingShipping.name = updateShippingDto.name
    existingShipping.type = updateShippingDto.type
    existingShipping.amount = updateShippingDto.amount
    existingShipping.is_global = updateShippingDto.is_global

    return await this.shippingRepository.save(existingShipping)

    // console.log(existingShipping)
    // return this.shippings[0];
  }

  async remove(id: number) {
    const existingShipping = await this.shippingRepository.findOne({where :{id}});

    if (!existingShipping) {
      throw new NotFoundException('Address not found');
    }
    await this.shippingRepository.remove(existingShipping);
  }
=======
  private shippings: Shipping[] = shippings

  create(createShippingDto: CreateShippingDto) {
    return this.shippings[0]
  }

  getShippings({}: GetShippingsDto) {
    return this.shippings
  }

  findOne(id: number) {
    return this.shippings.find((shipping) => shipping.id === Number(id))
  }

  update(id: number, updateShippingDto: UpdateShippingDto) {
    return this.shippings[0]
  }

  remove(id: number) {
    return `This action removes a #${id} shipping`
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
  }

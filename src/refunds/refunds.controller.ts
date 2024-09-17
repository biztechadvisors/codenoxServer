import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { Refund } from './entities/refund.entity';

@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) { }

  @Post()
  async create(@Body() createRefundDto: CreateRefundDto): Promise<Refund> {
    return this.refundsService.create(createRefundDto);
  }

  @Get()
  async findAll(): Promise<Refund[]> {
    return this.refundsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Refund> {
    return this.refundsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRefundDto: UpdateRefundDto): Promise<Refund> {
    return this.refundsService.update(+id, updateRefundDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.refundsService.remove(+id);
  }
}

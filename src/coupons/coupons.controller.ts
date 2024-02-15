/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { GetCouponsDto } from './dto/get-coupons.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { VerifyCouponInput } from './dto/verify-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) { }

  @Post()
  createCoupon(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  getCoupons(@Query() query: GetCouponsDto) {
    return this.couponsService.getCoupons(query);
  }

  @Get(':param')
  getCoupon(
    @Param('param') param: string,
  ) {
    return this.couponsService.getCoupon(param);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK) // Optionally set the HTTP status code if needed
  async verifyCoupon(@Body() input: VerifyCouponInput) {
    const { code } = input;

    try {
      const verifiedCoupon = await this.couponsService.verifyCoupon(code);

      if (verifiedCoupon) {
        return { message: 'Coupon is valid.', coupon: verifiedCoupon };
      } else {
        return { message: 'Coupon is either not found or expired.' };
      }
    } catch (error) {
      console.error('Promise rejected:', error);
      return { message: 'An error occurred while verifying the coupon.' };
    }
  }

  // @Get(':id/verify/')
  // verify(@Param('param') param: string, @Query('language') language: string) {
  //   return this.couponsService.getCoupon(param, language);
  // }

  // @Post('verify')
  // verifyCoupon(@Body('code') code: string) {
  //   return this.couponsService.verifyCoupon(code);
  // }

  @Put(':id')
  updateCoupon(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponsService.update(+id, updateCouponDto);
  }

  @Delete(':id')
  deleteCoupon(@Param('id') id: string) {
    return this.couponsService.remove(+id);
  }
}
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable, NotFoundException} from '@nestjs/common';
import { CreateCouponDto, pagination } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon, CouponType } from './entities/coupon.entity';
import { GetCouponsDto } from './dto/get-coupons.dto';
// import { paginate } from 'src/common/pagination/paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponRepository } from './coupon.repository';
import { Repository } from 'typeorm';
import { AttachmentRepository } from 'src/common/common.repository';
import { Attachment } from 'src/common/entities/attachment.entity';

// const coupons = plainToClass(Coupon, couponsJson);
// const options = {
//   keys: ['code'],
//   threshold: 0.3,
// };
// const fuse = new Fuse(coupons, options);

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository:Repository<Coupon>,
    // @InjectRepository(Attachment)
    // private readonly attachmentRepository:AttachmentRepository
  ){}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    console.log('Coupon Work')
    const coupon =new Coupon();
    coupon.code = createCouponDto.code
    coupon.language = createCouponDto.language
    coupon.description = createCouponDto.description
    coupon.minimum_cart_amount = createCouponDto.minimum_cart_amount
    // if(createCouponDto.image){
    //   const existingImage = await this.attachmentRepository.find({
    //     where:{original:createCouponDto.image.original, thumbnail:createCouponDto.image.thumbnail}
    //   })
    //   console.log(existingImage)
    //   coupon.image = existingImage.id
    // }
    coupon.is_valid = createCouponDto.is_valid
    coupon.amount = createCouponDto.amount
    coupon.active_from = createCouponDto.active_from
    coupon.expire_at = createCouponDto.expire_at
    const Type = createCouponDto.type?createCouponDto.type:CouponType.DEFAULT_COUPON
    switch (Type) {
      case CouponType.FIXED_COUPON:
        coupon.type = CouponType.FIXED_COUPON;
        break;
      case CouponType.FREE_SHIPPING_COUPON:
        coupon.type = CouponType.FREE_SHIPPING_COUPON;
        break;
      case CouponType.PERCENTAGE_COUPON:
        coupon.type = CouponType.PERCENTAGE_COUPON;
        break;
      default:
        coupon.type = CouponType.DEFAULT_COUPON;
        break;
    }
    coupon.type = Type
    if (Array.isArray(createCouponDto.translated_languages) && createCouponDto.translated_languages.length > 0) {
      coupon.translated_languages = createCouponDto.translated_languages;
    } else if (typeof createCouponDto.translated_languages === 'string') {
      coupon.translated_languages = [createCouponDto.translated_languages];
    }
    const saveCoupon = await this.couponRepository.save(coupon)
    // console.log(saveCoupon)
    // coupon.translated_languages = createCouponDto.translated_languages
    return saveCoupon
  }

  async getCoupons({ search, limit, page }: GetCouponsDto): Promise<{ data: Coupon[]; pagination: pagination }> {
    if (!page) page = 1;
    if (!limit) limit = 12;
  
    const startIndex = (page - 1) * limit;
  
    let queryBuilder = this.couponRepository.createQueryBuilder('coupon');
  
    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // TODO: Temp Solution
        if (key !== 'slug') {
          queryBuilder = queryBuilder.andWhere(`coupon.${key} = :value`, { value });
        }
      }
    }
  
    const [coupons, totalCount] = await queryBuilder
      .skip(startIndex)
      .take(limit)
      .getManyAndCount();
  
    const url = `/coupons?search=${search}&limit=${limit}`;
    const pagination = paginate(totalCount, page, limit, coupons.length, url);
  
    return {
      data: coupons,
      pagination,
    };
  }


  async getCoupon(param: string): Promise<Coupon[]> {
   const findAddress = await this.couponRepository.find({where:{code:param}});
   return findAddress;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const existingCoupons = await this.couponRepository.findOne({
      where: { id },
    });

    if (!existingCoupons) {
      throw new NotFoundException('Address not found');
    }
    console.log(existingCoupons)
    existingCoupons.code = updateCouponDto.code
    existingCoupons.language = updateCouponDto.language
    existingCoupons.description = updateCouponDto.description
    existingCoupons.minimum_cart_amount = updateCouponDto.minimum_cart_amount
    const Type = updateCouponDto.type?updateCouponDto.type:CouponType.DEFAULT_COUPON
    switch (Type) {
      case CouponType.FIXED_COUPON:
        existingCoupons.type = CouponType.FIXED_COUPON;
        break;
      case CouponType.FREE_SHIPPING_COUPON:
        existingCoupons.type = CouponType.FREE_SHIPPING_COUPON;
        break;
      case CouponType.PERCENTAGE_COUPON:
        existingCoupons.type = CouponType.PERCENTAGE_COUPON;
        break;
      default:
        existingCoupons.type = CouponType.DEFAULT_COUPON;
        break;
    }
    existingCoupons.type = Type
    if (Array.isArray(updateCouponDto.translated_languages) && updateCouponDto.translated_languages.length > 0) {
      existingCoupons.translated_languages = updateCouponDto.translated_languages;
    } else if (typeof updateCouponDto.translated_languages === 'string') {
      existingCoupons.translated_languages = [updateCouponDto.translated_languages];
    }

    const UpdateCoupon = await this.couponRepository.save(existingCoupons)

    return UpdateCoupon
  }

  async remove(id: number) {
    const existingCoupons = await this.couponRepository.findOne({where:{id}})
    if (!existingCoupons) {
      throw new NotFoundException('Address not found');
    }
    await this.couponRepository.remove(existingCoupons);
  }

  async verifyCoupon(code: string): Promise<Coupon | null>{
    console.log(code)
    const currentDate = new Date();
  const coupon = await this.couponRepository.findOne({where:{ code:code }});
  console.log(coupon)

  if (coupon && coupon.expire_at) {
    const expirationDate = new Date(coupon.expire_at);

    if (expirationDate > currentDate) {
      return coupon;
    } else {
      return null;
    }
  }

  return null;
    // return {
    //   is_valid: true,
    //   coupon: {
    //     id: 9,
    //     code: code,
    //     description: null,
    //     image: {
    //       id: 925,
    //       original:
    //         'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/925/5x2x.png',
    //       thumbnail:
    //         'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/925/conversions/5x2x-thumbnail.jpg',
    //     },
    //     type: 'fixed',
    //     amount: 5,
    //     active_from: '2021-03-28T05:46:42.000Z',
    //     expire_at: '2024-06-23T05:46:42.000Z',
    //     created_at: '2021-03-28T05:48:16.000000Z',
    //     updated_at: '2021-08-19T03:58:34.000000Z',
    //     deleted_at: null,
    //     is_valid: true,
    //   },
    // };
  }
}
function paginate(totalItems: number, currentPage: number, pageSize: number, totalResults: number, url: string): pagination {
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    totalResults,
    url,
    first_page_url: `${url}&page=1`,
    last_page_url: `${url}&page=${totalPages}`,
    next_page_url: currentPage < totalPages ? `${url}&page=${currentPage + 1}` : null,
    prev_page_url: currentPage > 1 ? `${url}&page=${currentPage - 1}` : null,
  };
}
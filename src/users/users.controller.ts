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
  UseGuards,
  Patch
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { DealerDto } from './dto/add-dealer.dto';
import { Dealer } from './entities/dealer.entity';
import { DealerEnquiry } from './entities/delaerForEnquiry.entity';
import { CreateDealerEnquiryDto, UpdateDealerEnquiryDto } from './dto/createDealerEnquiryDto.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('all')
  getAllUsers(@Query() query: GetUsersDto) {
    return this.usersService.getUsers(query);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.removeUser(+id);
  }

  @Post('unblock-user')
  activeUser(@Body('id') id: number) {
    return this.usersService.activeUser(+id);
  }

  @Post('block-user')
  banUser(@Body('id') id: number) {
    return this.usersService.banUser(+id);
  }

  @Post('make-admin')
  makeAdmin(@Param('user_id') id: number) {
    return this.usersService.makeAdmin(id);
  }
}

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  createProfile(@Body() createProfileDto: CreateProfileDto) {
    return this.usersService.createProfile(createProfileDto)
  }

  @Put(':id')
  updateProfile(@Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(updateProfileDto)
  }

  @Delete(':id')
  deleteProfile(@Param('id') id: number) {
    return this.usersService.removeUser(id);
  }
}

@Controller('dealers')
export class DealerController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async createDealer(@Body() dealerData: DealerDto) {
    return this.usersService.createDealer(dealerData);
  }

  @Get()
  async getAllDealers(@Query('createdBy') createdBy: number): Promise<Dealer[]> {
    return this.usersService.getAllDealers(createdBy);
  }

  @Get(':id')
  async getDealerById(@Param('id') id: number): Promise<Dealer> {
    return this.usersService.getDealerById(id);
  }

  @Put(':id')
  async updateDealer(@Param('id') id: number, @Body() dealerData: DealerDto): Promise<Dealer> {
    return this.usersService.updateDealer(id, dealerData);
  }

  @Delete(':id')
  async deleteDealer(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteDealer(id);
  }

}

@Controller('dealer-enquiries')
export class DealerEnquiryController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() createDealerEnquiryDto: CreateDealerEnquiryDto): Promise<DealerEnquiry> {
    return this.usersService.CreateDealerEnquiry(createDealerEnquiryDto);
  }

  @Get(':shopSlug')
  async findAll(@Param('shopSlug') shopSlug: string): Promise<DealerEnquiry[]> {
    return this.usersService.findAllDealerEnquiry(shopSlug);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<DealerEnquiry> {
    return this.usersService.findOneDealerEnquiry(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateDealerEnquiryDto: UpdateDealerEnquiryDto): Promise<DealerEnquiry> {
    return this.usersService.updateDealerEnquiry(id, updateDealerEnquiryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.usersService.removeDealerEnquiry(id);
  }
}
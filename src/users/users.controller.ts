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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto, CreateSocialDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUsersDto } from './dto/get-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  getAllUsers() {
    return this.usersService.getUsers();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(+id);
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
  makeAdmin(@Param('user_id') id: string) {
    return this.usersService.makeAdmin(id);
  }
}

@Controller('socials')
export class SocialController{
  constructor(private readonly usersService: UsersService) { }

  @Post()
  createSocial(@Body() createSocialDto: CreateSocialDto) {
    console.log(createSocialDto);
    return this.usersService.createSocial(createSocialDto);
  }

  @Get()
  getAllSocial() {
    return this.usersService.findAllSocial();
  }
}

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  createProfile(@Body() createProfileDto: CreateProfileDto) {
    console.log(createProfileDto);
    return this.usersService.createProfile(createProfileDto);
  }

  @Get()
  getAllProfile() {
    return this.usersService.findAll();
  }

  @Put(':id')
  updateProfile(@Body() updateProfileDto: UpdateProfileDto) {
    console.log(updateProfileDto);
  }

  @Delete(':id')
  deleteProfile(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}

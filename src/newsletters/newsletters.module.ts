/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { NewslettersController } from './newsletters.controller'
import { NewslettersService } from './newsletters.service'
import { NewsLetter } from './entities/newsletters.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsLetter]),
  ],
  controllers: [NewslettersController],
  providers: [NewslettersService],
})
export class NewslettersModule { }

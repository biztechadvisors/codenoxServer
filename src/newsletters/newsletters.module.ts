/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { NewslettersController } from './newsletters.controller'
import { NewslettersService } from './newsletters.service'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { NewsLetterRepository } from './newsletters.repository'
import { NewsLetter } from './entities/newsletters.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      NewsLetterRepository
    ]),
    TypeOrmModule.forFeature([NewsLetter]),
  ],
  controllers: [NewslettersController],
  providers: [NewslettersService],
})
export class NewslettersModule {}

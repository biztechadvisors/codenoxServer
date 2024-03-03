/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { AuthorsService } from './authors.service'
import { AuthorsController, TopAuthors } from './authors.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Author } from './entities/author.entity'
import { AuthorRepository } from './authors.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { ShopSocialsRepository } from 'src/shops/shops.repository'
import { ShopSocials } from 'src/settings/entities/setting.entity'
import { AttachmentRepository } from 'src/common/common.repository'
import { Attachment } from 'src/common/entities/attachment.entity'

@Module({
  imports: [TypeOrmExModule.forCustomRepository([AttachmentRepository, AuthorRepository, ShopSocialsRepository]),TypeOrmModule.forFeature([Attachment, Author, ShopSocials])],
  controllers: [AuthorsController, TopAuthors],
  providers: [AuthorsService],
})
export class AuthorsModule {}

import { Module } from '@nestjs/common'
import { AuthorsService } from './authors.service'
import { AuthorsController, TopAuthors } from './authors.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Author } from './entities/author.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  controllers: [AuthorsController, TopAuthors],
  providers: [AuthorsService],
})
export class AuthorsModule {}

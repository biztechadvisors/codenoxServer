import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoryRepository } from './categories.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { AttachmentRepository } from 'src/common/common.repository';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([CategoryRepository, AttachmentRepository])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule { }

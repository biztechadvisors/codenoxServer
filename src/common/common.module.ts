import { Module } from '@nestjs/common';
import { AttachmentRepository } from './common.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([AttachmentRepository])],
  controllers: [],
  providers: [],
})
export class CommonModule { }

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Ai } from './entities/ai.entity'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { AiRepository } from './ai.repository'

@Module({
  imports: [TypeOrmExModule.forCustomRepository([AiRepository]),TypeOrmModule.forFeature([Ai])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}

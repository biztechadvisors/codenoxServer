import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from 'src/common/entities/attachment.entity';
import { QnA } from './entities/qna.entity';
import { FAQ } from './entities/faq.entity';
import { FAQService } from './faq.service';
import { FAQController } from './faq.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [TypeOrmModule.forFeature([FAQ, QnA, Attachment]),
    CacheModule.register()],
    providers: [FAQService],
    controllers: [FAQController],
})
export class FAQModule { }

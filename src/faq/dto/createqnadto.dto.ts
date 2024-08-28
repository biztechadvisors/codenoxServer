import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { QnAType } from '../entities/qna.entity';

export class CreateQnADto {
    @IsNotEmpty()
    @IsString()
    question: string;

    @IsOptional()
    @IsString()
    answer?: string;

    @IsOptional()
    @IsEnum(QnAType)
    type?: QnAType;
}

export class UpdateQnADto {
    @IsOptional()
    @IsString()
    question?: string;

    @IsOptional()
    @IsString()
    answer?: string;

    @IsOptional()
    @IsEnum(QnAType)
    type?: QnAType;
}

import { QnAType } from '../entities/qna.entity';
export declare class CreateQnADto {
    question: string;
    answer?: string;
    type?: QnAType;
}
export declare class UpdateQnADto {
    question?: string;
    answer?: string;
    type?: QnAType;
}

import { GetQuestionDto } from './dto/get-questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
export declare class MyQuestionsService {
    findMyQuestions({ limit, page, search, answer }: GetQuestionDto): {};
    findMyQuestion(id: number): any[];
    create(createQuestionDto: CreateQuestionDto): any[];
    update(id: number, updateQuestionDto: UpdateQuestionDto): any[];
    delete(id: number): any[];
}

import { CreateQuestionDto } from './dto/create-question.dto';
import { GetQuestionDto } from './dto/get-questions.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { MyQuestionsService } from './my-questions.service';
export declare class MyQuestionsController {
    private myQuestionService;
    constructor(myQuestionService: MyQuestionsService);
    findAll(query: GetQuestionDto): {};
    find(id: string): any[];
    create(createQuestionDto: CreateQuestionDto): any[];
    update(id: string, updateQuestionDto: UpdateQuestionDto): any[];
    delete(id: string): any[];
}

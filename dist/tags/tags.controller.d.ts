import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { GetTagsDto, TagPaginator } from './dto/get-tags.dto';
export declare class TagsController {
    private readonly tagsService;
    constructor(tagsService: TagsService);
    create(createTagDto: CreateTagDto): Promise<import("./entities/tag.entity").Tag>;
    findAll(query: GetTagsDto): Promise<TagPaginator>;
    findOne(param: string, language: string): Promise<import("./entities/tag.entity").Tag>;
    update(id: string, updateTagDto: UpdateTagDto): Promise<import("./entities/tag.entity").Tag>;
    remove(id: string): Promise<void>;
}

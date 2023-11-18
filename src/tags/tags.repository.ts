import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { Tag } from "./entities/tag.entity";

@CustomRepository(Tag)
export class TagRepository extends Repository<Tag> { }
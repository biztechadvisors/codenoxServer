import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Cache } from 'cache-manager';
import { Region } from '../region/entities/region.entity';
import { Tag } from '../tags/entities/tag.entity';
export declare class BlogService {
    private readonly blogRepository;
    private readonly regionRepository;
    private readonly attachmentRepository;
    private readonly shopRepository;
    private readonly tagRepository;
    private readonly cacheManager;
    constructor(blogRepository: Repository<Blog>, regionRepository: Repository<Region>, attachmentRepository: Repository<Attachment>, shopRepository: Repository<Shop>, tagRepository: Repository<Tag>, cacheManager: Cache);
    createBlog(createBlogDto: CreateBlogDto): Promise<Blog>;
    getBlogById(id: number): Promise<Blog>;
    getAllBlogs(shopSlug: string, regionName: string | any, tagName?: string, page?: number, limit?: number, startDate?: string, endDate?: string): Promise<{
        data: Blog[];
        count: number;
    }>;
    updateBlog(id: number, updateBlogDto: UpdateBlogDto): Promise<Blog>;
    deleteBlog(id: number): Promise<void>;
}

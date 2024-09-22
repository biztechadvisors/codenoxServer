import { BlogService } from './blog.service';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
export declare class BlogController {
    private readonly blogService;
    constructor(blogService: BlogService);
    createBlog(createBlogDto: CreateBlogDto): Promise<Blog>;
    getAllBlogs(shopSlug: string, regionName: string | any, tagName?: string, page?: number, limit?: number, startDate?: string, endDate?: string): Promise<{
        data: Blog[];
        count: number;
    }>;
    getBlogById(id: number): Promise<Blog>;
    updateBlog(id: number, updateBlogDto: UpdateBlogDto): Promise<Blog>;
    deleteBlog(id: number): Promise<void>;
}

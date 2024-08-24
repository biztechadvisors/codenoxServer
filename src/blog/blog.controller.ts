import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    @Post()
    createBlog(@Body() createBlogDto: CreateBlogDto): Promise<Blog> {
        return this.blogService.createBlog(createBlogDto);
    }

    @Get('shop/:shopSlug/region/:regionName')
    getAllBlogs(@Param('shopSlug') shopSlug: string, @Param('regionName') regionName: string): Promise<Blog[]> {
        return this.blogService.getAllBlogs(shopSlug, regionName);
    }

    @Get(':id')
    getBlogById(@Param('id') id: number): Promise<Blog> {
        return this.blogService.getBlogById(id);
    }

    @Put(':id')
    updateBlog(@Param('id') id: number, @Body() updateBlogDto: UpdateBlogDto): Promise<Blog> {
        return this.blogService.updateBlog(id, updateBlogDto);
    }

    @Delete(':id')
    deleteBlog(@Param('id') id: number): Promise<void> {
        return this.blogService.deleteBlog(id);
    }
}

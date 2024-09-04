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

    @Get('shop/:shopSlug')
    getAllBlogs(
        @Param('shopSlug') shopSlug: string,
        @Query('regionName') regionName: string,
        @Query('tagName') tagName?: string,  // Optional query parameter for tagName
        @Query('page') page: number = 1,    // Default to page 1
        @Query('limit') limit: number = 10,  // Default to 10 items per page
        @Query('startDate') startDate?: string,  // Optional query parameter for startDate
        @Query('endDate') endDate?: string    // Optional query parameter for endDate
    ): Promise<{ data: Blog[], count: number }> {
        return this.blogService.getAllBlogs(shopSlug, regionName, tagName, page, limit, startDate, endDate);
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

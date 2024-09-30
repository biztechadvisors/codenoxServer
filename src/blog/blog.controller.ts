import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CacheService } from '../helpers/cacheService';

@Controller('blogs')
export class BlogController {
    constructor(private readonly blogService: BlogService,
        private readonly cacheService: CacheService
    ) { }

    @Post()
    async createBlog(@Body() createBlogDto: CreateBlogDto): Promise<Blog> {
        await this.cacheService.invalidateCacheBySubstring("blogs/shop");
        return this.blogService.createBlog(createBlogDto);
    }

    @Get('shop/:shopSlug')
    getAllBlogs(
        @Param('shopSlug') shopSlug: string,
        @Query('regionName') regionName: string | any,
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
    async updateBlog(@Param('id') id: number, @Body() updateBlogDto: UpdateBlogDto): Promise<Blog> {
        await this.cacheService.invalidateCacheBySubstring("blogs");
        return this.blogService.updateBlog(id, updateBlogDto);
    }

    @Delete(':id')
    async deleteBlog(@Param('id') id: number): Promise<void> {
        await this.cacheService.invalidateCacheBySubstring("blogs")
        return this.blogService.deleteBlog(id);
    }
}

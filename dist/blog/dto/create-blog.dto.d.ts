export declare class CreateBlogDto {
    title: string;
    content: string;
    shopId: number;
    attachmentIds?: number[];
    tagIds?: number[];
    regionName: string | null;
}

export declare function convertToSlug(text: string): string;
export declare function invalidateCacheBySubstring(substring: string, cacheManager: any, logger: any): Promise<void>;
declare const _default: {
    convertToSlug: typeof convertToSlug;
    invalidateCacheBySubstring: typeof invalidateCacheBySubstring;
};
export default _default;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCacheBySubstring = exports.convertToSlug = void 0;
function convertToSlug(text) {
    if (!text) {
        return '';
    }
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}
exports.convertToSlug = convertToSlug;
async function invalidateCacheBySubstring(substring, cacheManager, logger) {
    try {
        const pattern = `*${substring}*`;
        const keys = await getMatchingKeys(cacheManager, pattern);
        if (keys.length > 0) {
            await cacheManager.del(keys);
            logger.log(`Cache invalidated for keys containing substring "${substring}": ${keys.join(', ')}`);
        }
        else {
            logger.log(`No cache keys found containing the substring: ${substring}`);
        }
    }
    catch (error) {
        logger.error(`Error invalidating cache for substring "${substring}": ${error.message}`, error.stack);
    }
}
exports.invalidateCacheBySubstring = invalidateCacheBySubstring;
async function getMatchingKeys(cacheManager, pattern) {
    const store = cacheManager.store;
    if (typeof store.scan === 'function') {
        let cursor = '0';
        const keys = [];
        do {
            const result = await store.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = result[0];
            keys.push(...result[1]);
        } while (cursor !== '0');
        return keys;
    }
    else if (typeof store.keys === 'function') {
        return await store.keys(pattern);
    }
    throw new Error('Cache store does not support key scanning or pattern matching.');
}
exports.default = {
    convertToSlug,
    invalidateCacheBySubstring,
};
//# sourceMappingURL=index.js.map
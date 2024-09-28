// slug-utils.ts

// Utility function to convert text to a URL-friendly slug
export function convertToSlug(text: string): string {
  if (!text) {
    return ''; // Handle empty input
  }

  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export async function invalidateCacheBySubstring(substring: string, cacheManager: any, logger: any): Promise<void> {
  try {
    // Refine the pattern for matching the exact substring
    const pattern = `*${substring}*`;
    const keys = await getMatchingKeys(cacheManager, pattern);

    if (keys.length > 0) {
      // Delete the matching keys
      await cacheManager.del(keys);
      logger.log(`Cache invalidated for keys containing substring "${substring}": ${keys.join(', ')}`);
    } else {
      logger.log(`No cache keys found containing the substring: ${substring}`);
    }
  } catch (error) {
    logger.error(`Error invalidating cache for substring "${substring}": ${error.message}`, error.stack);
  }
}

async function getMatchingKeys(cacheManager: any, pattern: string): Promise<string[]> {
  const store = cacheManager.store;

  if (typeof store.scan === 'function') {
    let cursor = '0';
    const keys = [];

    do {
      const result = await store.scan(cursor, 'MATCH', pattern, 'COUNT', 100); // Scan 100 keys per iteration
      cursor = result[0]; // Update the cursor
      keys.push(...result[1]); // Collect matching keys
    } while (cursor !== '0'); // Stop when cursor is 0, indicating the scan is complete

    return keys;
  } else if (typeof store.keys === 'function') {
    return await store.keys(pattern);
  }

  throw new Error('Cache store does not support key scanning or pattern matching.');
}

// Export the utility functions
export default {
  convertToSlug,
  invalidateCacheBySubstring,
};

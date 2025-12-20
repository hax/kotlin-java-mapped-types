/**
 * Unified HTTP cache utility using make-fetch-happen
 * 
 * This module provides a centralized HTTP fetching mechanism with:
 * - RFC 7234 compliant HTTP caching (If-Modified-Since, ETag)
 * - Automatic retry logic
 * - Disk-based cache storage
 * - Consistent error handling
 */

import makeFetchHappen from 'make-fetch-happen';
import * as path from 'path';
import * as os from 'os';

/**
 * Options for cached fetch
 */
export interface CachedFetchOptions {
  /**
   * Cache directory path. Defaults to temp directory.
   */
  cachePath?: string;
  
  /**
   * Whether to force a fresh fetch, bypassing cache
   */
  forceRefresh?: boolean;
}

/**
 * Default cache directory path
 */
const DEFAULT_CACHE_PATH = path.join(os.tmpdir(), 'kotlin-java-mapped-types-cache');

/**
 * Create a cached fetch function with the given options
 */
function createCachedFetch(options: CachedFetchOptions = {}) {
  const cachePath = options.cachePath || DEFAULT_CACHE_PATH;
  
  return makeFetchHappen.defaults({
    cachePath,
    // Cache GET requests by default
    cache: options.forceRefresh ? 'reload' : 'default',
    // Retry configuration
    retry: {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 60000,
    },
  });
}

/**
 * Fetch a resource with HTTP caching support
 * 
 * This function uses make-fetch-happen to provide:
 * - Automatic caching with If-Modified-Since and ETag headers
 * - Retry logic for failed requests
 * - Consistent error handling
 * 
 * @param url - The URL to fetch
 * @param options - Caching and fetch options
 * @returns Response text content
 */
async function cachedFetch(
  url: string,
  options: CachedFetchOptions = {}
): Promise<any> {
  const fetch = createCachedFetch(options);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch ${url}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch a resource and return the text content
 * 
 * @param url - The URL to fetch
 * @param options - Caching and fetch options
 * @returns Text content of the response
 */
export async function cachedFetchText(
  url: string,
  options: CachedFetchOptions = {}
): Promise<string> {
  const response = await cachedFetch(url, options);
  return await response.text();
}

/**
 * Fetch a resource and return parsed JSON
 * 
 * @param url - The URL to fetch
 * @param options - Caching and fetch options
 * @returns Parsed JSON object
 */
export async function cachedFetchJson<T = any>(
  url: string,
  options: CachedFetchOptions = {}
): Promise<T> {
  const response = await cachedFetch(url, options);
  return await response.json();
}

/**
 * Clear the HTTP cache
 * 
 * @param cachePath - Optional custom cache path. If not provided, uses default.
 */
export async function clearCache(cachePath?: string): Promise<void> {
  const { rm } = await import('fs/promises');
  const targetPath = cachePath || DEFAULT_CACHE_PATH;
  
  try {
    await rm(targetPath, { recursive: true, force: true });
    console.log(`Cache cleared: ${targetPath}`);
  } catch (error) {
    console.error(`Failed to clear cache: ${error}`);
  }
}

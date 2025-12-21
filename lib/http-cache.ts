/**
 * Unified HTTP cache layer with RFC 7234 compliant caching
 * Uses make-fetch-happen for automatic If-Modified-Since and ETag headers
 */

import fetch from 'make-fetch-happen';
import * as path from 'path';

/**
 * Cache options for HTTP requests
 */
interface CacheOptions {
  cachePath?: string;
  retry?: {
    retries?: number;
    factor?: number;
    minTimeout?: number;
    maxTimeout?: number;
  };
  offline?: boolean;
}

// Default cache path in doc-cache directory
const DEFAULT_CACHE_PATH = path.join(process.cwd(), 'doc-cache');

/**
 * Create a cached fetch function with default options
 */
function createCachedFetch(options: CacheOptions = {}) {
  const cachePath = options.cachePath || DEFAULT_CACHE_PATH;
  const retry = options.retry || {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 10000
  };
  const offline = options.offline || false;

  return (url: string, opts?: Record<string, any>) => {
    if (offline) {
      // In offline mode, only use cache, never make network requests
      return fetch(url, {
        cachePath,
        retry,
        cache: 'only-if-cached',
        ...opts
      });
    }
    return fetch(url, {
      cachePath,
      retry,
      ...opts
    });
  };
}

// Default cached fetch instance
let cachedFetch = createCachedFetch();
let isOfflineMode = false;

/**
 * Set offline mode for all cached fetch operations
 * When enabled, only cached responses will be returned
 * 
 * @param offline - Whether to enable offline mode
 */
export function setOfflineMode(offline: boolean): void {
  isOfflineMode = offline;
  cachedFetch = createCachedFetch({ offline });
}

/**
 * Get current offline mode status
 */
export function getOfflineMode(): boolean {
  return isOfflineMode;
}

/**
 * Fetch text content from a URL with HTTP caching
 * Automatically handles If-Modified-Since and ETag headers for efficient caching
 * 
 * @param url - The URL to fetch
 * @param options - Optional cache configuration
 * @returns The text content of the response
 * @throws Error if the request fails after retries
 */
export async function cachedFetchText(url: string, options?: CacheOptions): Promise<string> {
  const fetchFn = options ? createCachedFetch(options) : cachedFetch;
  
  try {
    const response = await fetchFn(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    throw new Error(`Error fetching ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetch JSON content from a URL with HTTP caching
 * 
 * @param url - The URL to fetch
 * @param options - Optional cache configuration
 * @returns The parsed JSON content
 * @throws Error if the request fails after retries
 */
export async function cachedFetchJson<T = any>(url: string, options?: CacheOptions): Promise<T> {
  const fetchFn = options ? createCachedFetch(options) : cachedFetch;
  
  try {
    const response = await fetchFn(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Configure the default cache path for all cached fetch operations
 * 
 * @param newPath - The new cache directory path
 */
export function configureCachePath(newPath: string): void {
  cachedFetch = createCachedFetch({ cachePath: newPath });
}

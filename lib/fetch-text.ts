/**
 * Unified HTTP cache layer with RFC 7234 compliant caching
 * Uses make-fetch-happen for automatic If-Modified-Since and ETag headers
 */

import fetch from 'make-fetch-happen';
import * as url from 'url';

const DEFAULT_CACHE_PATH = url.fileURLToPath(import.meta.resolve('../doc-cache'));

export let offlineMode = false;

export function setOfflineMode(offline: boolean) {
  offlineMode = offline;
}

export async function fetchText(url: string, options: fetch.MakeFetchHappenOptions = {}) {
  if (offlineMode) {
    options.cache = 'only-if-cached';
  } else {
    options.retry ??= true;
  }
  options.cachePath ??= DEFAULT_CACHE_PATH;

  const startTime = Date.now();
  
  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    const cacheEvent = response.ok
      ? response.headers?.get('X-Local-Cache-Status')
      : 'request failed';
    const modeLabel = offlineMode ? 'offline' : 'online';
    const logMessage = `${modeLabel} ${cacheEvent} ${response.status} ${response.statusText} ${url} ${duration}ms`;
    if (!response.ok) {
      console.warn(logMessage);
      return null;
    } else {
      console.log(logMessage);
      return await response.text();
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    const errMessage = Error.isError(error) ? error.message : String(error);
    console.error(`Failed ${url} after ${duration}ms (${errMessage})`);
    return null;
  }
}

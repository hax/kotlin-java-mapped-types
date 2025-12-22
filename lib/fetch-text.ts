import fetch from 'make-fetch-happen';
import { CACHE_PATH } from './config.ts';

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
  options.cachePath ??= CACHE_PATH;

  const startTime = Date.now();
  
  try {
    const response = await fetch(url, options);
    const cacheStatus = response.headers.get('x-local-cache-status') ?? 'no';
    const duration = Date.now() - startTime;
    const logMessage = `[${cacheStatus} cache ${duration}ms] ${response.status} ${response.statusText} ${url}`;
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
    console.error(`Failed to fetch ${url} after ${duration}ms (${errMessage})`);
    return null;
  }
}

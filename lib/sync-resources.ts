#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as yaml from 'yaml';
import { extractMappedTypesFromDocs } from './extract-mapped-types.ts';
import type { TypeMapping } from './extract-mapped-types.ts';
import { fetchText, offlineMode, setOfflineMode } from './fetch-text.ts';
import { MAPPED_TYPES_FILE } from './config.ts';
import { typeNameToKotlinUrl, typeNameToJavaUrl } from './utils.ts';

const KOTLIN_DOC_URL = 'https://kotlinlang.org/docs/java-interop.html';

async function fetchKotlinDocumentation(): Promise<void> {
  const html = await fetchText(KOTLIN_DOC_URL);
  if (html == null) {
    if (offlineMode) throw new Error('Kotlin documentation not available from cache');
    else throw new Error('Failed to fetch Kotlin documentation'); 
  }
}

async function extractAndCacheMappedTypes(): Promise<TypeMapping[]> {
  console.log('\nExtracting mapped types from Kotlin documentation...');
  
  const mappedTypes = await extractMappedTypesFromDocs();
  
  const yamlContent = yaml.stringify(mappedTypes);
  let hasChanged = true;
  try {
    const existingContent = await fs.readFile(MAPPED_TYPES_FILE, 'utf-8');
    hasChanged = existingContent !== yamlContent;
  } catch {
  }
  
  if (hasChanged) {
    await fs.writeFile(MAPPED_TYPES_FILE, yamlContent, 'utf-8');
    console.log(`✓ Extracted and cached ${mappedTypes.length} mapped types to root directory`);
  } else {
    console.log(`✓ Mapped types unchanged (${mappedTypes.length} types)`);
  }
  
  return mappedTypes;
}

async function fetchAndCacheDefinitions(mappedTypes: TypeMapping[]): Promise<void> {
  console.log('\nFetching type definitions to populate HTTP cache...');
  
  let kotlinFetched = 0;
  let kotlinFailed = 0;
  let javaFetched = 0;
  let javaFailed = 0;
  
  await Promise.all(mappedTypes.map(async (mapping) => {
    const kotlinUrl = typeNameToKotlinUrl(mapping.kotlin);
    const javaUrl = typeNameToJavaUrl(mapping.java);

    const [kotlinHtml, javaHtml] = await Promise.all([
      fetchText(kotlinUrl),
      fetchText(javaUrl),
    ]);

    if (kotlinHtml) {
      kotlinFetched++;
    } else {
      kotlinFailed++;
    }

    if (javaHtml) {
      javaFetched++;
    } else {
      javaFailed++;
    }
  }));
  
  console.log('\nSummary:');
  console.log(`  Kotlin definitions: ${kotlinFetched} cached, ${kotlinFailed} failed`);
  console.log(`  Java definitions: ${javaFetched} cached, ${javaFailed} failed`);
}

async function main() {
  const offlineMode = process.argv.includes('--offline');
  if (offlineMode) {
    console.log('=== Running in Offline Mode ===\n');
    setOfflineMode(true);
  } else {
    console.log('=== Syncing Resources ===\n');
  }
  
  await fetchKotlinDocumentation();
  const mappedTypes = await extractAndCacheMappedTypes();
  await fetchAndCacheDefinitions(mappedTypes);
  
  if (offlineMode) {
    console.log('\n=== Offline Mode Validation Complete ===');
  } else {
    console.log('\n=== Sync Complete ===');
    console.log('HTTP cache saved to doc-cache/ directory');
    console.log('Mapped types saved to mapped-types.yaml');
  }
}

if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { main as syncResources };

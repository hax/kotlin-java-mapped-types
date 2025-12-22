#!/usr/bin/env node
/**
 * Sync script to fetch data sources and cache them in the resources directory
 * This script:
 * 1. Fetches the Kotlin documentation page containing mapped types
 * 2. Extracts mapped types to a YAML file
 * 3. Fetches Kotlin and Java type definitions for each mapped type
 * 4. Compares with existing cached data and updates if changed
 */

import * as fs from 'fs/promises';
import * as yaml from 'yaml';
import { extractMappedTypesFromDocs } from './extract-mapped-types.ts';
import type { TypeMapping } from './extract-mapped-types.ts';
import { fetchText, offlineMode, setOfflineMode } from './fetch-text.ts';
import { MAPPED_TYPES_FILE } from './config.ts';

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
  
  // Check if content has changed
  const yamlContent = yaml.stringify(mappedTypes);
  let hasChanged = true;
  try {
    const existingContent = await fs.readFile(MAPPED_TYPES_FILE, 'utf-8');
    hasChanged = existingContent !== yamlContent;
  } catch {
    // File doesn't exist yet
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

/**
 * Convert Kotlin type name to documentation URL
 * Handles nested types like Map.Entry by converting all class names to kebab-case
 * 
 * Note: This function assumes package names are lowercase and class names start with uppercase.
 * This follows the standard Kotlin/Java naming conventions.
 */
function typeNameToKotlinUrl(typeName: string): string {
  const parts = typeName.split('.');
  
  // Find where the package ends and class names begin
  // Package names are lowercase, class names start with uppercase
  let packageEndIndex = parts.findIndex(part => /^[A-Z]/.test(part));
  if (packageEndIndex === -1) {
    packageEndIndex = parts.length;
  }
  
  const packagePath = parts.slice(0, packageEndIndex).join('.');
  const classNames = parts.slice(packageEndIndex);
  
  // Convert all class names to kebab-case with leading dash
  const kebabNames = classNames.map(name => 
    name.replace(/([A-Z])/g, '-$1').toLowerCase()
  ).join('/');
  
  return `https://kotlinlang.org/api/core/kotlin-stdlib/${packagePath}/${kebabNames}/`;
}

/**
 * Convert Java type name to Android documentation URL
 * Handles nested types like Map.Entry by keeping dots for nested classes
 * 
 * Note: This function assumes package names are lowercase and class names start with uppercase.
 * This follows the standard Kotlin/Java naming conventions.
 */
function typeNameToJavaUrl(typeName: string): string {
  const parts = typeName.split('.');
  
  // Find where the package ends and class names begin
  // Package names are lowercase, class names start with uppercase
  let packageEndIndex = parts.findIndex(part => /^[A-Z]/.test(part));
  if (packageEndIndex === -1) {
    packageEndIndex = parts.length;
  }
  
  const packagePath = parts.slice(0, packageEndIndex).join('/');
  const classPath = parts.slice(packageEndIndex).join('.');
  
  return `https://developer.android.com/reference/${packagePath}/${classPath}`;
}

async function main() {
  // Check for offline mode flag
  const offlineMode = process.argv.includes('--offline');
  if (offlineMode) {
    console.log('=== Running in Offline Mode ===\n');
    setOfflineMode(true);
  } else {
    console.log('=== Syncing Resources ===\n');
  }
  
  // Step 1: Fetch and cache Kotlin documentation
  await fetchKotlinDocumentation();
  
  // Step 2: Extract and cache mapped types to root directory
  const mappedTypes = await extractAndCacheMappedTypes();
  
  // Step 3: Fetch and cache all type definitions
  await fetchAndCacheDefinitions(mappedTypes);
  
  if (offlineMode) {
    console.log('\n=== Offline Mode Validation Complete ===');
  } else {
    console.log('\n=== Sync Complete ===');
    console.log('HTTP cache saved to doc-cache/ directory');
    console.log('Mapped types saved to mapped-types.yaml');
  }
}

// Run if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { main as syncResources };

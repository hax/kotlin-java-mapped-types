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
import * as path from 'path';
import * as yaml from 'yaml';
import { extractMappedTypesFromDocs } from './extract-mapped-types.ts';
import type { TypeMapping } from './extract-mapped-types.ts';
import { generateJavaDefinition } from './fetch-java-definition.ts';
import { generateKotlinDefinition } from './fetch-kotlin-definition.ts';

const RESOURCES_DIR = path.join(process.cwd(), 'resources');
const KOTLIN_DOC_URL = 'https://kotlinlang.org/docs/java-interop.html';

/**
 * Ensure resources directory structure exists
 */
async function ensureResourcesStructure() {
  await fs.mkdir(RESOURCES_DIR, { recursive: true });
  await fs.mkdir(path.join(RESOURCES_DIR, 'kotlin'), { recursive: true });
  await fs.mkdir(path.join(RESOURCES_DIR, 'java'), { recursive: true });
}

/**
 * Fetch and cache the Kotlin documentation page
 */
async function fetchKotlinDocumentation(): Promise<boolean> {
  console.log('Fetching Kotlin documentation...');
  try {
    const response = await fetch(KOTLIN_DOC_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch documentation: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const docPath = path.join(RESOURCES_DIR, 'kotlin-doc.html');
    
    // Check if content has changed
    let hasChanged = true;
    try {
      const existingContent = await fs.readFile(docPath, 'utf-8');
      hasChanged = existingContent !== html;
    } catch (error) {
      // File doesn't exist yet
    }
    
    if (hasChanged) {
      await fs.writeFile(docPath, html, 'utf-8');
      console.log('✓ Kotlin documentation cached');
      return true;
    } else {
      console.log('✓ Kotlin documentation unchanged');
      return false;
    }
  } catch (error) {
    console.error('Error fetching Kotlin documentation:', error);
    return false;
  }
}

/**
 * Extract and cache mapped types
 */
async function extractAndCacheMappedTypes(): Promise<TypeMapping[]> {
  console.log('\nExtracting mapped types from Kotlin documentation...');
  
  const mappedTypes = await extractMappedTypesFromDocs();
  const mappedTypesPath = path.join(RESOURCES_DIR, 'mapped-types.yaml');
  
  // Check if content has changed
  const yamlContent = yaml.stringify(mappedTypes);
  let hasChanged = true;
  try {
    const existingContent = await fs.readFile(mappedTypesPath, 'utf-8');
    hasChanged = existingContent !== yamlContent;
  } catch (error) {
    // File doesn't exist yet
  }
  
  if (hasChanged) {
    await fs.writeFile(mappedTypesPath, yamlContent, 'utf-8');
    console.log(`✓ Extracted and cached ${mappedTypes.length} mapped types`);
  } else {
    console.log(`✓ Mapped types unchanged (${mappedTypes.length} types)`);
  }
  
  return mappedTypes;
}

/**
 * Convert type name to a safe filename
 */
function typeNameToFilename(typeName: string): string {
  return typeName.replace(/\./g, '_');
}

/**
 * Fetch and cache all type definitions
 */
async function fetchAndCacheDefinitions(mappedTypes: TypeMapping[]): Promise<void> {
  console.log('\nFetching type definitions...');
  
  let kotlinUpdated = 0;
  let kotlinUnchanged = 0;
  let javaUpdated = 0;
  let javaUnchanged = 0;
  
  for (const mapping of mappedTypes) {
    const kotlinFileName = `${typeNameToFilename(mapping.kotlin)}.kt`;
    const javaFileName = `${typeNameToFilename(mapping.java)}.java`;
    const kotlinPath = path.join(RESOURCES_DIR, 'kotlin', kotlinFileName);
    const javaPath = path.join(RESOURCES_DIR, 'java', javaFileName);
    
    // Fetch Kotlin definition
    try {
      console.log(`Fetching ${mapping.kotlin}...`);
      const kotlinDefinition = await generateKotlinDefinition(mapping.kotlin);
      
      let kotlinChanged = true;
      try {
        const existingContent = await fs.readFile(kotlinPath, 'utf-8');
        kotlinChanged = existingContent !== kotlinDefinition;
      } catch (error) {
        // File doesn't exist yet
      }
      
      if (kotlinChanged) {
        await fs.writeFile(kotlinPath, kotlinDefinition, 'utf-8');
        kotlinUpdated++;
        console.log(`  ✓ Cached ${kotlinFileName}`);
      } else {
        kotlinUnchanged++;
        console.log(`  ✓ ${kotlinFileName} unchanged`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to fetch ${mapping.kotlin}:`, error);
    }
    
    // Fetch Java definition
    try {
      console.log(`Fetching ${mapping.java}...`);
      const javaDefinition = await generateJavaDefinition(mapping.java);
      
      let javaChanged = true;
      try {
        const existingContent = await fs.readFile(javaPath, 'utf-8');
        javaChanged = existingContent !== javaDefinition;
      } catch (error) {
        // File doesn't exist yet
      }
      
      if (javaChanged) {
        await fs.writeFile(javaPath, javaDefinition, 'utf-8');
        javaUpdated++;
        console.log(`  ✓ Cached ${javaFileName}`);
      } else {
        javaUnchanged++;
        console.log(`  ✓ ${javaFileName} unchanged`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to fetch ${mapping.java}:`, error);
    }
  }
  
  console.log('\nSummary:');
  console.log(`  Kotlin definitions: ${kotlinUpdated} updated, ${kotlinUnchanged} unchanged`);
  console.log(`  Java definitions: ${javaUpdated} updated, ${javaUnchanged} unchanged`);
}

/**
 * Main sync function
 */
async function main() {
  console.log('=== Syncing Resources ===\n');
  
  // Ensure directory structure
  await ensureResourcesStructure();
  
  // Step 1: Fetch and cache Kotlin documentation
  await fetchKotlinDocumentation();
  
  // Step 2: Extract and cache mapped types
  const mappedTypes = await extractAndCacheMappedTypes();
  
  // Step 3: Fetch and cache all type definitions
  await fetchAndCacheDefinitions(mappedTypes);
  
  console.log('\n=== Sync Complete ===');
}

// Run if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { main as syncResources };

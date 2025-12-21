#!/usr/bin/env node
/**
 * Main script to generate all mappings from network/cache
 * Fetches type definitions from official documentation using HTTP cache
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { parseJavaDefinition, parseKotlinDefinition, generateMapping } from './generate-mapping-details.ts';
import { generateKotlinDefinitionFromHtml } from './fetch-kotlin-definition.ts';
import { generateJavaDefinitionFromHtml } from './fetch-java-definition.ts';
import * as yaml from 'yaml';
import { setOfflineMode, fetchText } from './fetch-text.ts';

interface TypeMapping {
  kotlin: string;
  java: string;
}

function sanitizeDirName(kotlinType: string, javaType: string): string {
  return `${kotlinType.replace(/\./g, '_')}_to_${javaType.replace(/\./g, '_')}`;
}

/**
 * Convert type name to a safe filename
 */
function typeNameToFilename(typeName: string): string {
  return typeName.replace(/\./g, '_');
}

/**
 * Convert Kotlin type name to documentation URL
 * Handles nested types like Map.Entry by converting all class names to kebab-case
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
  // Check for offline mode flag (default is false, meaning online mode)
  const offlineMode = process.argv.includes('--offline');
  if (offlineMode) {
    console.log('Running in offline mode (using only cache)...\n');
    setOfflineMode(true);
  } else {
    console.log('Running in online mode (will fetch from network using cache)...\n');
  }
  
  console.log('Generating Kotlin-Java type mappings...\n');
  
  const docCacheDir = path.join(process.cwd(), 'doc-cache');
  const mappedTypesPath = path.join(process.cwd(), 'mapped-types.yaml');
  
  // Ensure doc-cache directory exists for HTTP cache
  await fs.mkdir(docCacheDir, { recursive: true });
  
  // Check if mapped-types.yaml exists
  try {
    await fs.access(mappedTypesPath);
  } catch (error) {
    console.error('Error: mapped-types.yaml not found in root directory. Please run "npm run sync" first.');
    process.exit(1);
  }
  
  // Read mapped types from root YAML
  const mappedTypesContent = await fs.readFile(mappedTypesPath, 'utf-8');
  const MAPPED_TYPES: TypeMapping[] = yaml.parse(mappedTypesContent);
  
  const mappingsDir = path.join(process.cwd(), 'mappings');
  await fs.mkdir(mappingsDir, { recursive: true });
  
  for (const mapping of MAPPED_TYPES) {
    const dirName = sanitizeDirName(mapping.kotlin, mapping.java);
    const mappingDir = path.join(mappingsDir, dirName);
    await fs.mkdir(mappingDir, { recursive: true });
    
    console.log(`Processing: ${mapping.kotlin} <-> ${mapping.java}`);
    
    try {
      // Fetch HTML from network/cache
      const kotlinUrl = typeNameToKotlinUrl(mapping.kotlin);
      const javaUrl = typeNameToJavaUrl(mapping.java);
      
      console.log(`  Fetching ${mapping.kotlin} from ${kotlinUrl}...`);
      const kotlinHtml = await fetchText(kotlinUrl);
      if (!kotlinHtml) {
        throw new Error(`Cached HTML missing for ${mapping.kotlin}`);
      }
      
      console.log(`  Fetching ${mapping.java} from ${javaUrl}...`);
      const javaHtml = await fetchText(javaUrl);
      if (!javaHtml) {
        throw new Error(`Cached HTML missing for ${mapping.java}`);
      }
      
      // Parse HTML and generate definitions
      const kotlinDefinition = await generateKotlinDefinitionFromHtml(mapping.kotlin, kotlinHtml);
      const javaDefinition = await generateJavaDefinitionFromHtml(mapping.java, javaHtml);
      
      // Save generated definitions
      const kotlinDefFile = path.join(mappingDir, 'kotlin-definition.kt');
      await fs.writeFile(kotlinDefFile, kotlinDefinition, 'utf-8');
      
      const javaDefFile = path.join(mappingDir, 'java-definition.java');
      await fs.writeFile(javaDefFile, javaDefinition, 'utf-8');
      
      // Generate mapping details
      const javaType = parseJavaDefinition(javaDefinition);
      const kotlinType = parseKotlinDefinition(kotlinDefinition);
      const mappings = generateMapping(javaType, kotlinType);
      
      const mappingDetailsFile = path.join(mappingDir, 'mapping-details.yaml');
      await fs.writeFile(mappingDetailsFile, yaml.stringify(mappings), 'utf-8');
      
      console.log(`  ✓ Generated definitions and mappings in ${dirName}`);
    } catch (error) {
      console.error(`  ✗ Failed to process ${mapping.kotlin} <-> ${mapping.java}:`, error);
    }
  }
  
  console.log(`\nDone! Generated ${MAPPED_TYPES.length} type mappings.`);
}

// Run if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

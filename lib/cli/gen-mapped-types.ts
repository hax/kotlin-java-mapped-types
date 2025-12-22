#!/usr/bin/env node

/**
 * Generate mapped-types-details.yaml file with type mappings and simplified signatures.
 * 
 * This script:
 * 1. Scans all type mapping directories in .defs/
 * 2. Parses Java and Kotlin definition files using the same logic as calc-mappings.ts
 * 3. Calculates mappings between Java and Kotlin members
 * 4. Simplifies signatures to show only method names and parameter names
 * 5. Outputs a YAML file with all type mappings
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { stringify } from 'yaml';
import { parseJavaDef, parseKotlinDef, calcMapping } from '../mappings.ts';
import type { TypeInfo } from '../utils.ts';
import { DEFS_DIR, MAPPED_TYPES_FILE } from '../config.ts';
import { simplifySignature, extractMethodName } from '../signature-utils.ts';

interface SimplifiedMapping {
  kotlin: string;
  java: string;
}

interface TypeMappingWithDetails {
  kotlin: TypeInfo;
  java: TypeInfo;
  mappings: SimplifiedMapping[];
}

/**
 * Process a single type mapping directory
 */
async function processTypeMapping(dirPath: string): Promise<TypeMappingWithDetails | null> {
  const kotlinDefFile = join(dirPath, 'kotlin-definition.kt');
  const javaDefFile = join(dirPath, 'java-definition.java');
  
  try {
    // Read definition files
    const kotlinContent = await readFile(kotlinDefFile, 'utf-8');
    const javaContent = await readFile(javaDefFile, 'utf-8');
    
    // Parse definitions using the same logic as calc-mappings.ts
    const kotlinType = parseKotlinDef(kotlinContent);
    const javaType = parseJavaDef(javaContent);
    const detailedMappings = calcMapping(javaType, kotlinType);
    
    // Build type info from parsed types
    const kotlinInfo: TypeInfo = {
      kind: kotlinType.kind,
      name: `${kotlinType.package}.${kotlinType.name}`
    };
    const javaInfo: TypeInfo = {
      kind: javaType.kind,
      name: `${javaType.package}.${javaType.name}`
    };
    
    // Simplify mappings and deduplicate
    const simplifiedMappings: SimplifiedMapping[] = [];
    const seenMethodNames = new Set<string>();
    for (const mapping of detailedMappings) {
      const kotlinSimplified = simplifySignature(mapping.kotlin);
      const javaSimplified = simplifySignature(mapping.java);
      
      const kotlinMethodName = extractMethodName(kotlinSimplified);
      
      if (!seenMethodNames.has(kotlinMethodName)) {
        seenMethodNames.add(kotlinMethodName);
        simplifiedMappings.push({
          kotlin: kotlinSimplified,
          java: javaSimplified
        });
      }
    }
    
    return {
      kotlin: kotlinInfo,
      java: javaInfo,
      mappings: simplifiedMappings
    };
  } catch (error) {
    // Log the error but continue processing other directories
    console.warn(`Warning: Failed to process directory ${dirPath}: ${error}`);
    return null;
  }
}

async function main() {
  console.log('Generating mapped-types-details.yaml with simplified mappings...');
  
  const entries = await readdir(DEFS_DIR, { withFileTypes: true });
  const mappings: TypeMappingWithDetails[] = [];
  const seen = new Set<string>();
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const dirPath = join(DEFS_DIR, entry.name);
    const mapping = await processTypeMapping(dirPath);
    
    if (mapping) {
      const key = `${mapping.kotlin.name}::${mapping.java.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      
      mappings.push(mapping);
      console.log(`Found mapping: ${mapping.kotlin.name} <-> ${mapping.java.name} (${mapping.mappings.length} mappings)`);
    }
  }
  
  mappings.sort((a, b) => a.kotlin.name.localeCompare(b.kotlin.name));
  
  const output = stringify({ mappings });
  await writeFile(MAPPED_TYPES_FILE, output, 'utf-8');
  
  console.log(`\nGenerated ${MAPPED_TYPES_FILE} with ${mappings.length} type mappings`);
}

if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { main as generateMappedTypesDetails };

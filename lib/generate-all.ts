#!/usr/bin/env node
/**
 * Main script to generate all mappings
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { generateJavaDefinition } from './fetch-java-definition.ts';
import { generateKotlinDefinition } from './fetch-kotlin-definition.ts';
import { parseJavaDefinition, parseKotlinDefinition, generateMapping } from './generate-mapping-details.ts';
import { extractMappedTypesFromDocs } from './extract-mapped-types.ts';
import * as yaml from 'yaml';

function sanitizeDirName(kotlinType: string, javaType: string): string {
  return `${kotlinType.replace(/\./g, '_')}_to_${javaType.replace(/\./g, '_')}`;
}

async function main() {
  console.log('Generating Kotlin-Java type mappings...\n');
  
  // Extract mapped types from Kotlin documentation
  const MAPPED_TYPES = await extractMappedTypesFromDocs();
  
  const mappingsDir = path.join(process.cwd(), 'mappings');
  await fs.mkdir(mappingsDir, { recursive: true });
  
  for (const mapping of MAPPED_TYPES) {
    const dirName = sanitizeDirName(mapping.kotlin, mapping.java);
    const mappingDir = path.join(mappingsDir, dirName);
    await fs.mkdir(mappingDir, { recursive: true });
    
    console.log(`Processing: ${mapping.kotlin} <-> ${mapping.java}`);
    
    // Generate Java definition
    const javaDefinition = await generateJavaDefinition(mapping.java);
    const javaDefFile = path.join(mappingDir, 'java-definition.java');
    await fs.writeFile(javaDefFile, javaDefinition, 'utf-8');
    
    // Generate Kotlin definition
    const kotlinDefinition = await generateKotlinDefinition(mapping.kotlin);
    const kotlinDefFile = path.join(mappingDir, 'kotlin-definition.kt');
    await fs.writeFile(kotlinDefFile, kotlinDefinition, 'utf-8');
    
    // Generate mapping details
    const javaType = parseJavaDefinition(javaDefinition);
    const kotlinType = parseKotlinDefinition(kotlinDefinition);
    const mappings = generateMapping(javaType, kotlinType);
    
    const mappingDetailsFile = path.join(mappingDir, 'mapping-details.yaml');
    await fs.writeFile(mappingDetailsFile, yaml.stringify(mappings), 'utf-8');
    
    console.log(`  ✓ Generated definitions and mappings in ${dirName}`);
  }
  
  console.log(`\nDone! Generated ${MAPPED_TYPES.length} type mappings.`);
}

// Run if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

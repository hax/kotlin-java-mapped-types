#!/usr/bin/env node
/**
 * Main script to generate all mappings from cached resources
 * This version reads from the resources directory instead of fetching from the network
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { parseJavaDefinition, parseKotlinDefinition, generateMapping } from './generate-mapping-details.ts';
import * as yaml from 'yaml';

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

async function main() {
  console.log('Generating Kotlin-Java type mappings from cached resources...\n');
  
  const resourcesDir = path.join(process.cwd(), 'resources');
  const mappedTypesPath = path.join(resourcesDir, 'mapped-types.yaml');
  
  // Check if resources exist
  try {
    await fs.access(mappedTypesPath);
  } catch (error) {
    console.error('Error: Resources not found. Please run "npm run sync" first to fetch and cache the data sources.');
    process.exit(1);
  }
  
  // Read mapped types from cached YAML
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
      // Read Kotlin definition from resources
      const kotlinFileName = `${typeNameToFilename(mapping.kotlin)}.kt`;
      const kotlinSourcePath = path.join(resourcesDir, 'kotlin', kotlinFileName);
      const kotlinDefinition = await fs.readFile(kotlinSourcePath, 'utf-8');
      const kotlinDefFile = path.join(mappingDir, 'kotlin-definition.kt');
      await fs.writeFile(kotlinDefFile, kotlinDefinition, 'utf-8');
      
      // Read Java definition from resources
      const javaFileName = `${typeNameToFilename(mapping.java)}.java`;
      const javaSourcePath = path.join(resourcesDir, 'java', javaFileName);
      const javaDefinition = await fs.readFile(javaSourcePath, 'utf-8');
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

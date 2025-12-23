#!/usr/bin/env node

/**
 * CLI tool to map Java definitions to TypeScript declaration format (.d.ts).
 * 
 * Usage: 
 *   map-to-dts <java-type-name>
 *   map-to-dts <java-def-file>
 *   map-to-dts <dts-file>
 * 
 * Example: 
 *   map-to-dts java.util.SortedMap
 *   map-to-dts ./my-type.java
 *   map-to-dts ./my-type.d.ts
 */

import { getJavaDef } from '../get-java-def.ts';
import { mapJavaToDTS } from '../map-java-to-dts.ts';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

const USAGE = `Usage: map-to-dts <java-type-name | java-def-file | dts-file>

Examples:
  map-to-dts java.util.SortedMap     # Fetch and map a Java type
  map-to-dts ./my-type.java          # Map from Java definition file
  map-to-dts ./my-type.d.ts          # Map from DTS file`;

if (process.argv.length < 3) {
    console.error(USAGE);
    process.exit(1);
}

const input = process.argv[2];

async function main() {
  let javaDefContent: string;
  
  // Determine if input is a file path or type name
  if (existsSync(input)) {
    console.log(`Reading from file: ${input}\n`);
    javaDefContent = await readFile(input, 'utf-8');
    
    // If it's a .d.ts file, we might want to parse it differently
    if (input.endsWith('.d.ts')) {
      console.log('Input is already in d.ts format. Applying mappings...\n');
      // For now, treat it as Java def content
      // TODO: Add proper d.ts parsing support
    }
  } else {
    // Treat as Java type name
    console.log(`Mapping ${input} to d.ts format...\n`);
    javaDefContent = await getJavaDef(input);
  }
  
  // Map to d.ts
  const result = await mapJavaToDTS(javaDefContent);
  
  console.log('=== TypeScript Declaration (.d.ts) ===');
  console.log(result.dts);
  
  if (result.appliedMappings.length > 0) {
    console.log('\n=== Applied Mappings ===');
    for (const mapping of result.appliedMappings) {
      console.log(`  ${mapping.from} → ${mapping.to}`);
    }
  }
  
  if (result.unmappedTypes.length > 0) {
    console.log('\n=== Unmapped Types ===');
    console.log('The following types could not be mapped:');
    for (const type of result.unmappedTypes) {
      console.log(`  - ${type}`);
    }
  }
  
  console.log('\n✓ Mapping completed');
}

main().catch(error => {
  console.error(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

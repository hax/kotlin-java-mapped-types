#!/usr/bin/env node

/**
 * CLI tool to map Java definitions to TypeScript declaration format (.d.ts).
 * 
 * Usage: 
 *   map-to-dts <java-type-name>
 *   cat file.java | map-to-dts
 *   cat file.d.ts | map-to-dts
 * 
 * Example: 
 *   map-to-dts java.util.SortedMap
 *   cat my-type.java | map-to-dts
 */

import { getJavaDef } from '../get-java-def.ts';
import { mapJavaToKotlin } from '../map-java-to-dts.ts';
import { stdin as processStdin } from 'process';

const USAGE = `Usage: map-to-dts [java-type-name]
       cat file.java | map-to-dts
       cat file.d.ts | map-to-dts

Examples:
  map-to-dts java.util.SortedMap     # Fetch and map a Java type
  cat my-type.java | map-to-dts      # Map from stdin (Java definition)
  cat my-type.d.ts | map-to-dts      # Map from stdin (d.ts file)`;

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of processStdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function main() {
  let javaDefContent: string;
  
  // Check if we have stdin input
  const hasStdin = !processStdin.isTTY;
  
  if (hasStdin) {
    // Read from stdin
    console.log('Reading from stdin...\n');
    const input = await readStdin();
    
    // If it looks like d.ts content, we need to handle it
    // For now, we'll treat all stdin input as Java definition
    // TODO: Implement proper d.ts parsing when needed
    if (input.includes('interface') || input.includes('class')) {
      javaDefContent = input;
    } else {
      javaDefContent = input;
    }
  } else if (process.argv.length >= 3) {
    // Treat as Java type name
    const typeName = process.argv[2];
    console.log(`Mapping ${typeName} to d.ts format...\n`);
    javaDefContent = await getJavaDef(typeName);
  } else {
    console.error(USAGE);
    process.exit(1);
  }
  
  // Map to d.ts
  const result = await mapJavaToKotlin(javaDefContent);
  
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

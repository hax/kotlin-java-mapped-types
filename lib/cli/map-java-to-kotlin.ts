#!/usr/bin/env node

/**
 * CLI tool to map Java definitions to Kotlin types in d.ts format.
 * 
 * Usage: 
 *   map-java-to-kotlin <java-type-name>
 *   cat file.java | map-java-to-kotlin
 *   cat file.d.ts | map-java-to-kotlin
 * 
 * Example: 
 *   map-java-to-kotlin java.util.SortedMap
 *   cat my-type.java | map-java-to-kotlin
 *   cat my-type.d.ts | map-java-to-kotlin
 */

import { getJavaDef } from '../get-java-def.ts';
import { javaDefToDTS, applyKotlinMappings } from '../map-java-to-kotlin.ts';
import { stdin as processStdin } from 'process';

const USAGE = `Usage: map-java-to-kotlin [java-type-name]
       cat file.java | map-java-to-kotlin
       cat file.d.ts | map-java-to-kotlin

Examples:
  map-java-to-kotlin java.util.SortedMap     # Fetch and map a Java type
  cat my-type.java | map-java-to-kotlin      # Map from stdin (Java definition)
  cat my-type.d.ts | map-java-to-kotlin      # Map from stdin (d.ts file)`;

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of processStdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

let dtsContent: string | undefined;
let typeName: string | undefined;

// Check if we have stdin input
const hasStdin = !processStdin.isTTY;

if (hasStdin) {
  // Read from stdin
  console.log('Reading from stdin...\n');
  const input = await readStdin();
  
  // Check if it's a Java file by looking for package declaration
  if (input.includes('package ')) {
    // Convert Java definition to d.ts
    dtsContent = javaDefToDTS(input);
  } else {
    // Assume it's already d.ts format
    dtsContent = input;
  }
  
  // Check if type name was provided as argument for validation
  if (process.argv.length >= 3) {
    typeName = process.argv[2];
  }
}

if (process.argv.length >= 3 && !hasStdin) {
  // Treat as Java type name
  typeName = process.argv[2];
  console.log(`Mapping ${typeName} to d.ts format...\n`);
  const javaDefContent = await getJavaDef(typeName);
  dtsContent = javaDefToDTS(javaDefContent);
}

if (!dtsContent) {
  console.error(USAGE);
  process.exit(1);
}

// Apply Kotlin type mappings
const result = await applyKotlinMappings(dtsContent);

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

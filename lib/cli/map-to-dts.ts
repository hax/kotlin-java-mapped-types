#!/usr/bin/env node

/**
 * CLI tool to map Java definitions to TypeScript declaration format (.d.ts).
 * 
 * Usage: 
 *   map-to-dts <java-type-name>
 *   cat file.java | map-to-dts
 * 
 * Example: 
 *   map-to-dts java.util.SortedMap
 *   cat my-type.java | map-to-dts
 */

import { getJavaDef } from '../get-java-def.ts';
import { mapJavaToKotlin } from '../map-java-to-kotlin.ts';
import { stdin as processStdin } from 'process';

const USAGE = `Usage: map-to-dts [java-type-name]
       cat file.java | map-to-dts

Examples:
  map-to-dts java.util.SortedMap     # Fetch and map a Java type
  cat my-type.java | map-to-dts      # Map from stdin (Java definition)`;

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of processStdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

let javaDefContent: string;

// Check if we have stdin input
const hasStdin = !processStdin.isTTY;

if (hasStdin) {
  // Read from stdin
  console.log('Reading from stdin...\n');
  const input = await readStdin();
  
  // Check if it's a Java file by looking for package declaration
  if (input.includes('package ')) {
    javaDefContent = input;
  } else {
    console.error('Error: Input does not appear to be a Java definition (no package declaration found)');
    process.exit(1);
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

#!/usr/bin/env node

import { extractMappedTypesFromDocs } from './extract-mapped-types.ts';

async function main() {
  console.log('Extracting Kotlin-Java mapped types from documentation...\n');
  
  const mappings = await extractMappedTypesFromDocs();
  
  console.log(`\nFound ${mappings.length} type mappings:`);
  for (const mapping of mappings) {
    console.log(`  ${mapping.kotlin} <-> ${mapping.java}`);
  }
}

main().catch(console.error);

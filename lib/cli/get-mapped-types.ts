#!/usr/bin/env node

import { getMappedTypes } from '../get-mapped-types.ts';

import './offline.ts'

console.log('Extracting Kotlin-Java mapped types from documentation...\n');
const mappings = await getMappedTypes();
console.log(`\nFound ${mappings.length} type mappings:`);
for (const [java, kotlin] of mappings) {
  console.log(`  ${java.padEnd(32)}<-> ${kotlin}`);
}

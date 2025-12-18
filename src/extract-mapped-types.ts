#!/usr/bin/env node
/**
 * Extract Kotlin-Java mapped types from Kotlin documentation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';

// Hardcoded mapped types based on official Kotlin documentation
// https://kotlinlang.org/docs/java-interop.html#mapped-types
const MAPPED_TYPES = [
  { kotlin: 'kotlin.Any', java: 'java.lang.Object' },
  { kotlin: 'kotlin.Byte', java: 'java.lang.Byte' },
  { kotlin: 'kotlin.Short', java: 'java.lang.Short' },
  { kotlin: 'kotlin.Int', java: 'java.lang.Integer' },
  { kotlin: 'kotlin.Long', java: 'java.lang.Long' },
  { kotlin: 'kotlin.Char', java: 'java.lang.Character' },
  { kotlin: 'kotlin.Float', java: 'java.lang.Float' },
  { kotlin: 'kotlin.Double', java: 'java.lang.Double' },
  { kotlin: 'kotlin.Boolean', java: 'java.lang.Boolean' },
  { kotlin: 'kotlin.String', java: 'java.lang.String' },
  { kotlin: 'kotlin.CharSequence', java: 'java.lang.CharSequence' },
  { kotlin: 'kotlin.Throwable', java: 'java.lang.Throwable' },
  { kotlin: 'kotlin.Cloneable', java: 'java.lang.Cloneable' },
  { kotlin: 'kotlin.Comparable', java: 'java.lang.Comparable' },
  { kotlin: 'kotlin.Enum', java: 'java.lang.Enum' },
  { kotlin: 'kotlin.Annotation', java: 'java.lang.annotation.Annotation' },
  { kotlin: 'kotlin.collections.Iterator', java: 'java.util.Iterator' },
  { kotlin: 'kotlin.collections.Iterable', java: 'java.lang.Iterable' },
  { kotlin: 'kotlin.collections.Collection', java: 'java.util.Collection' },
  { kotlin: 'kotlin.collections.Set', java: 'java.util.Set' },
  { kotlin: 'kotlin.collections.List', java: 'java.util.List' },
  { kotlin: 'kotlin.collections.ListIterator', java: 'java.util.ListIterator' },
  { kotlin: 'kotlin.collections.Map', java: 'java.util.Map' },
  { kotlin: 'kotlin.collections.Map.Entry', java: 'java.util.Map.Entry' },
  { kotlin: 'kotlin.collections.MutableIterator', java: 'java.util.Iterator' },
  { kotlin: 'kotlin.collections.MutableIterable', java: 'java.lang.Iterable' },
  { kotlin: 'kotlin.collections.MutableCollection', java: 'java.util.Collection' },
  { kotlin: 'kotlin.collections.MutableSet', java: 'java.util.Set' },
  { kotlin: 'kotlin.collections.MutableList', java: 'java.util.List' },
  { kotlin: 'kotlin.collections.MutableListIterator', java: 'java.util.ListIterator' },
  { kotlin: 'kotlin.collections.MutableMap', java: 'java.util.Map' },
  { kotlin: 'kotlin.collections.MutableMap.MutableEntry', java: 'java.util.Map.Entry' },
];

interface TypeMapping {
  kotlin: string;
  java: string;
}

async function main() {
  console.log('Extracting Kotlin-Java mapped types...');
  
  // For now, use the hardcoded list. In the future, this could scrape the Kotlin docs.
  const mappings: TypeMapping[] = MAPPED_TYPES;
  
  console.log(`Found ${mappings.length} type mappings`);
  
  // Create directories for each mapping
  const mappingsDir = path.join(process.cwd(), 'mappings');
  await fs.mkdir(mappingsDir, { recursive: true });
  
  for (const mapping of mappings) {
    const dirName = `${mapping.kotlin.replace(/\./g, '_')}_to_${mapping.java.replace(/\./g, '_')}`;
    const mappingDir = path.join(mappingsDir, dirName);
    await fs.mkdir(mappingDir, { recursive: true });
    console.log(`Created directory: ${dirName}`);
  }
  
  console.log('Done!');
}

main().catch(console.error);

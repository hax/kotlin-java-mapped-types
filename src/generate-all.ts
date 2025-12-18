#!/usr/bin/env node
/**
 * Main script to generate all mappings
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { generateJavaDefinition } from './fetch-java-definition.js';
import { generateKotlinDefinition } from './fetch-kotlin-definition.js';
import { parseJavaDefinition, parseKotlinDefinition, generateMapping } from './generate-mapping-details.js';
import * as yaml from 'yaml';

// Mapped types from Kotlin documentation
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

function sanitizeDirName(kotlinType: string, javaType: string): string {
  return `${kotlinType.replace(/\./g, '_')}_to_${javaType.replace(/\./g, '_')}`;
}

async function main() {
  console.log('Generating Kotlin-Java type mappings...\n');
  
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
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

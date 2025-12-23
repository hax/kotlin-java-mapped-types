#!/usr/bin/env node

/**
 * Generate JSON file with detailed type mappings.
 * 
 * This script outputs the same mapping information as gen-mapped-types.ts
 * but in JSON format for easier programmatic consumption.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { parseJavaDef, parseKotlinDef, calcMapping, toDTS } from '../mappings.ts';
import { DEFS_DIR } from '../config.ts';
import { getMappedTypes } from '../get-mapped-types.ts';

console.log('Generating mapped types JSON...\n');

interface MemberMapping {
  javaName: string;
  javaSig: string;
  kotlinName: string;
  kotlinSig: string;
}

interface TypeMapping {
  javaType: string;
  kotlinType: string;
  members: MemberMapping[];
}

const dirnames = await readdir(DEFS_DIR);
const mappedTypes = await getMappedTypes();
const allMappings: TypeMapping[] = [];

for (const [java, kotlin] of mappedTypes) {
  const mapping = await processTypeMapping(java, kotlin);
  if (mapping) {
    allMappings.push(mapping);
  }
}

const outputPath = join(DEFS_DIR, '..', 'mapped-types.json');
await writeFile(outputPath, JSON.stringify(allMappings, null, 2), 'utf-8');

console.log(`\nGenerated ${allMappings.length} type mappings`);
console.log(`Output: ${outputPath}`);

async function processTypeMapping(java: string, kotlin: string): Promise<TypeMapping | null> {
  const dirname = dirnames.find(dirname => java.startsWith(dirname));
  if (dirname == null) {
    return null;
  }

  try {
    const files = await readdir(join(DEFS_DIR, dirname));
    const javaName = files.find(file => file.endsWith('.java'));
    const kotlinName = files.find(file => file.endsWith('.kt') && kotlin.startsWith(file.slice(0, -3)));
    if (javaName == null || kotlinName == null) {
      return null;
    }

    const javaDefFile = join(DEFS_DIR, dirname, javaName);
    const kotlinDefFile = join(DEFS_DIR, dirname, kotlinName);

    const javaContent = await readFile(javaDefFile, 'utf-8');
    const javaType = parseJavaDef(javaContent);

    const kotlinContent = await readFile(kotlinDefFile, 'utf-8');  
    const kotlinType = parseKotlinDef(kotlinContent);
    
    const mappings = calcMapping(javaType, kotlinType);
    
    const members: MemberMapping[] = mappings.map(([javaMember, kotlinMember]) => ({
      javaName: javaMember.name,
      javaSig: toDTS(javaMember),
      kotlinName: kotlinMember.name,
      kotlinSig: toDTS(kotlinMember)
    }));
    
    return {
      javaType: java,
      kotlinType: kotlin,
      members
    };
  } catch (error) {
    console.error(`Error processing ${java}: ${error}`);
    return null;
  }
}

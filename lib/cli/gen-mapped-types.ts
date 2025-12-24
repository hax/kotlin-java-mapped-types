#!/usr/bin/env node

/**
 * Generate mapped types documentation in both markdown and JSON formats.
 * 
 * This script:
 * 1. Scans all type mapping directories in .defs/
 * 2. Parses Java and Kotlin definition files
 * 3. Calculates mappings between Java and Kotlin members
 * 4. Outputs both mapped-types.md and mapped-types.json files
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { createWriteStream, type WriteStream } from 'fs';
import { join } from 'path';
import { parseJavaDef, parseKotlinDef, calcMapping, toDTS } from '../mappings.ts';
import { DEFS_DIR, MAPPED_TYPES_FILE } from '../config.ts';
import { getMappedTypes } from '../get-mapped-types.ts';

console.log('Generating mapped types documentation...\n');

// Markdown output
const outputStream = createWriteStream(MAPPED_TYPES_FILE + '.md', { encoding: 'utf-8' });
outputStream.write('# Mapped Types\n');

// JSON output
interface MemberMapping {
  javaName: string;
  javaSignature: string;
  kotlinName: string;
  kotlinSignature: string;
}

interface TypeMapping {
  javaType: string;
  kotlinType: string;
  members: MemberMapping[];
}

const mappings: TypeMapping[] = [];

const dirnames = await readdir(DEFS_DIR);
const mappedTypes = await getMappedTypes();

for (const [java, kotlin] of mappedTypes) {
  outputStream.write(`\n## ${java} <-> ${kotlin}\n`);
  const typeMapping = await processTypeMapping(outputStream, java, kotlin);
  if (typeMapping) {
    mappings.push(typeMapping);
  }
}

outputStream.end();
console.log(`\nGenerated ${MAPPED_TYPES_FILE}.md`);

// Write JSON output
const jsonOutputPath = MAPPED_TYPES_FILE.replace(/\.md$/, '') + '.json';
await writeFile(jsonOutputPath, JSON.stringify(mappings, null, 2), 'utf-8');
console.log(`Generated ${mappings.length} type mappings`);
console.log(`JSON output: ${jsonOutputPath}`);

async function processTypeMapping(output: WriteStream, java: string, kotlin: string): Promise<TypeMapping | null> {
  const dirname = dirnames.find(dirname => java.startsWith(dirname));
  if (dirname == null) {
    return null;
  }

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
  
  const members: MemberMapping[] = [];
  
  for (const [javaMember, kotlinMember] of mappings) {
    output.write(
`- ${javaMember.name}
  \`${toDTS(javaMember)}\`
  \`${toDTS(kotlinMember)}\`
`);
    
    members.push({
      javaName: javaMember.name,
      javaSignature: toDTS(javaMember),
      kotlinName: kotlinMember.name,
      kotlinSignature: toDTS(kotlinMember)
    });
  }
  
  return {
    javaType: java,
    kotlinType: kotlin,
    members
  };
}
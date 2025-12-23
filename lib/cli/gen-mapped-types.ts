#!/usr/bin/env node

/**
 * Generate mapped-types-details.yaml file with type mappings and simplified signatures.
 * 
 * This script:
 * 1. Scans all type mapping directories in .defs/
 * 2. Parses Java and Kotlin definition files using the same logic as calc-mappings.ts
 * 3. Calculates mappings between Java and Kotlin members
 * 4. Outputs a YAML file with all type mappings
 */

import { stringify } from 'yaml';
import { readdir, readFile } from 'fs/promises';
import { createWriteStream, type WriteStream } from 'fs';
import { join } from 'path';
import { parseJavaDef, parseKotlinDef, calcMapping, type ParsedMember } from '../mappings.ts';
import { DEFS_DIR, MAPPED_TYPES_FILE } from '../config.ts';
import { getMappedTypes } from '../get-mapped-types.ts';

console.log('Generating mapped types documentation...\n');

const outputStream = createWriteStream(MAPPED_TYPES_FILE, { encoding: 'utf-8' });
outputStream.write('# Mapped Types\n');

const dirnames = await readdir(DEFS_DIR);

const mappedTypes = await getMappedTypes();
for (const [java, kotlin] of mappedTypes) {
  outputStream.write(`\n## ${java} <-> ${kotlin}\n`);

  await processTypeMapping(outputStream, java, kotlin);
}
outputStream.end();
console.log(`\nGenerated ${MAPPED_TYPES_FILE}`);

interface SimplifiedMapping {
  java: string;
  kotlin: string;
}

async function processTypeMapping(output: WriteStream, java: string, kotlin: string): Promise<void> {
  const dirname = dirnames.find(dirname => java.startsWith(dirname));
  if (dirname == null) {
    return;
  }

  const files = await readdir(join(DEFS_DIR, dirname));
  const javaName = files.find(file => file.endsWith('.java'));
  const kotlinName = files.find(file => file.endsWith('.kt') && kotlin.startsWith(file.slice(0, -3)));
  if (javaName == null || kotlinName == null) {
    return;
  }

  const javaDefFile = join(DEFS_DIR, dirname, javaName);
  const kotlinDefFile = join(DEFS_DIR, dirname, kotlinName);

  const javaContent = await readFile(javaDefFile, 'utf-8');
  const javaType = parseJavaDef(javaContent);

  const kotlinContent = await readFile(kotlinDefFile, 'utf-8');  
  const kotlinType = parseKotlinDef(kotlinContent);
  
  const mappings = calcMapping(javaType, kotlinType);
  for (const [java, kotlin] of mappings) {
    output.write(
`- ${java.name}
  \`${toDTS(java)}\`
  \`${toDTS(kotlin)}\`
`);
  }
}

function toDTS(member: ParsedMember): string {
  const mods = member.modifiers.length > 0 ? member.modifiers.join(' ') + ' ' : '';
  if (member.kind === 'constructor') {
    return `${mods}constructor${member.type}`;
  } else {
    return `${mods}${member.name}${member.type}`;
  }
}

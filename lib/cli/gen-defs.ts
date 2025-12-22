#!/usr/bin/env node

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { getMappedTypes } from '../get-mapped-types.ts';
import { getKotlinDef } from '../get-kotlin-def.ts';
import { getJavaDef } from '../get-java-def.ts';
import { MAPPINGS_DIR } from '../config.ts';
import { isPrimitiveJavaType } from '../utils.ts';

import './offline.ts'

const dryMode = process.argv.includes('--dry-run');
if (dryMode) {
  console.log('Running in dry-run mode (no files will be written)...\n');
}

const mappedTypes = await getMappedTypes();
if (!dryMode) {
  await mkdir(MAPPINGS_DIR, { recursive: true });
}

let count = 0;
for (const [java, kotlin] of mappedTypes) {
  if (isPrimitiveJavaType(java)) {
    // Skip primitive types (primitives do not have members to map)
    continue;
  }
  if (java.endsWith('[]')) {
    // Skip array types (arrays only have `length` property)
    continue;
  }
  
  const javaName = java.replace(/<.*/g, ''); // Remove generics
  let kotlinName = kotlin.replace(/<.*/g, ''); // Remove generics
  // Remove nullable markers or platform types markers
  if (kotlinName.endsWith('?') || kotlinName.endsWith('!')) kotlinName = kotlinName.slice(0, -1);

  if (kotlinName == "kotlin.Cloneable") {
    // Skip Cloneable, see: #21
    continue
  }
  
  const mappingDir = join(MAPPINGS_DIR, javaName);
  if (!dryMode) {
    await mkdir(mappingDir, { recursive: true });
  }
  
  console.log(`Processing: ${javaName} <-> ${kotlinName}`);
  
  await Promise.all([
    (async () => {
      const javaDef = await getJavaDef(javaName);
      const javaDefFile = join(mappingDir, 'def.java');
      if (dryMode) {
        console.log(`  [dry-run] would write ${javaDefFile}`);
        return;
      }
      await writeFile(javaDefFile, javaDef, 'utf-8');
    })(),
    (async () => {
      const kotlinDef = await getKotlinDef(kotlinName);
      const kotlinDefFile = join(mappingDir, `${kotlinName}.kt`);
      if (dryMode) {
        console.log(`  [dry-run] would write ${kotlinDefFile}`);
        return;
      }
      await writeFile(kotlinDefFile, kotlinDef, 'utf-8');
    })()
  ]);
  
  console.log(`  ✓ Generated definitions in ${javaName}`);
  count++;
}

console.log(`\nDone! Generated ${count} mapped types.`);
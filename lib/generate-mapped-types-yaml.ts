#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import { MAPPINGS_DIR, MAPPED_TYPES_FILE } from './config.ts';
import { extractTypeInfo } from './utils.ts';
import type { TypeInfo } from './utils.ts';

interface TypeMapping {
  kotlin: TypeInfo;
  java: TypeInfo;
}

async function main() {
  console.log('Scanning mapping directories...');
  
  const entries = await fs.readdir(MAPPINGS_DIR, { withFileTypes: true });
  const mappings: TypeMapping[] = [];
  const seen = new Set<string>();
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const dirPath = path.join(MAPPINGS_DIR, entry.name);
    const kotlinDefFile = path.join(dirPath, 'kotlin-definition.kt');
    const javaDefFile = path.join(dirPath, 'java-definition.java');
    
    const kotlinInfo = await extractTypeInfo(kotlinDefFile);
    const javaInfo = await extractTypeInfo(javaDefFile);
    
    if (kotlinInfo && javaInfo) {
      const key = `${kotlinInfo.name}::${javaInfo.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        mappings.push({
          kotlin: kotlinInfo,
          java: javaInfo
        });
        console.log(`Found mapping: ${kotlinInfo.name} (${kotlinInfo.kind}) <-> ${javaInfo.name} (${javaInfo.kind})`);
      }
    }
  }
  
  mappings.sort((a, b) => a.kotlin.name.localeCompare(b.kotlin.name));
  
  const output = yaml.stringify({ mappings });
  await fs.writeFile(MAPPED_TYPES_FILE, output, 'utf-8');
  
  console.log(`\nGenerated ${MAPPED_TYPES_FILE} with ${mappings.length} unique mappings`);
}

if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { stringify } from 'yaml';
import { parseJavaDef, parseKotlinDef, calcMapping } from '../mappings.ts';
import { extractTypeInfo, type TypeInfo } from '../utils.ts';
import { DEFS_DIR, MAPPED_TYPES_FILE } from '../config.ts';
import { simplifySignature, extractMethodName } from '../signature-utils.ts';

interface SimplifiedMapping {
  kotlin: string;
  java: string;
}

interface TypeMappingWithDetails {
  kotlin: TypeInfo;
  java: TypeInfo;
  mappings: SimplifiedMapping[];
}

async function main() {
  console.log('Generating mapped-types-details.yaml with simplified mappings...');
  
  const entries = await readdir(DEFS_DIR, { withFileTypes: true });
  const mappings: TypeMappingWithDetails[] = [];
  const seen = new Set<string>();
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const dirPath = join(DEFS_DIR, entry.name);
    const kotlinDefFile = join(dirPath, 'kotlin-definition.kt');
    const javaDefFile = join(dirPath, 'java-definition.java');
    
    const kotlinInfo = await extractTypeInfo(kotlinDefFile);
    const javaInfo = await extractTypeInfo(javaDefFile);
    
    if (kotlinInfo && javaInfo) {
      const key = `${kotlinInfo.name}::${javaInfo.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      
      const kotlinContent = await readFile(kotlinDefFile, 'utf-8');
      const javaContent = await readFile(javaDefFile, 'utf-8');
      
      const kotlinType = parseKotlinDef(kotlinContent);
      const javaType = parseJavaDef(javaContent);
      const detailedMappings = calcMapping(javaType, kotlinType);
      
      const simplifiedMappings: SimplifiedMapping[] = [];
      const seenMethodNames = new Set<string>();
      for (const mapping of detailedMappings) {
        const kotlinSimplified = simplifySignature(mapping.kotlin);
        const javaSimplified = simplifySignature(mapping.java);
        
        const kotlinMethodName = extractMethodName(kotlinSimplified);
        
        if (!seenMethodNames.has(kotlinMethodName)) {
          seenMethodNames.add(kotlinMethodName);
          simplifiedMappings.push({
            kotlin: kotlinSimplified,
            java: javaSimplified
          });
        }
      }
      
      mappings.push({
        kotlin: kotlinInfo,
        java: javaInfo,
        mappings: simplifiedMappings
      });
      
      console.log(`Found mapping: ${kotlinInfo.name} <-> ${javaInfo.name} (${simplifiedMappings.length} mappings)`);
    }
  }
  
  mappings.sort((a, b) => a.kotlin.name.localeCompare(b.kotlin.name));
  
  const output = stringify({ mappings });
  await writeFile(MAPPED_TYPES_FILE, output, 'utf-8');
  
  console.log(`\nGenerated ${MAPPED_TYPES_FILE} with ${mappings.length} type mappings`);
}

if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { main as generateMappedTypesDetails };

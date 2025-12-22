#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import { generateKotlinDefinitionFromHtml } from './fetch-kotlin-definition.ts';
import { generateJavaDefinitionFromHtml } from './fetch-java-definition.ts';
import * as yaml from 'yaml';
import { setOfflineMode, fetchText } from './fetch-text.ts';
import { generateMappedTypesDetails } from './generate-mapped-types-details-yaml.ts';
import { MAPPED_TYPES_FILE, MAPPINGS_DIR } from './config.ts';
import { typeNameToKotlinUrl, typeNameToJavaUrl } from './utils.ts';

interface TypeMapping {
  kotlin: string;
  java: string;
}

function sanitizeDirName(kotlinType: string, javaType: string): string {
  return `${kotlinType.replace(/\./g, '_')}_to_${javaType.replace(/\./g, '_')}`;
}

async function main() {
  const offlineMode = process.argv.includes('--offline');
  if (offlineMode) {
    console.log('Running in offline mode (using only cache)...\n');
    setOfflineMode(true);
  } else {
    console.log('Running in online mode (will fetch from network using cache)...\n');
  }
  
  console.log('Generating Kotlin-Java type mappings...\n');
  
  try {
    await fs.access(MAPPED_TYPES_FILE);
  } catch (error) {
    console.error('Error: mapped-types.yaml not found in root directory. Please run "npm run sync" first.');
    process.exit(1);
  }
  
  const mappedTypesContent = await fs.readFile(MAPPED_TYPES_FILE, 'utf-8');
  const MAPPED_TYPES: TypeMapping[] = yaml.parse(mappedTypesContent);
  
  await fs.mkdir(MAPPINGS_DIR, { recursive: true });
  
  for (const mapping of MAPPED_TYPES) {
    const dirName = sanitizeDirName(mapping.kotlin, mapping.java);
    const mappingDir = path.join(MAPPINGS_DIR, dirName);
    await fs.mkdir(mappingDir, { recursive: true });
    
    console.log(`Processing: ${mapping.kotlin} <-> ${mapping.java}`);
    
    try {
      const kotlinUrl = typeNameToKotlinUrl(mapping.kotlin);
      const javaUrl = typeNameToJavaUrl(mapping.java);
      
      console.log(`  Fetching ${mapping.kotlin} from ${kotlinUrl}...`);
      const kotlinHtml = await fetchText(kotlinUrl);
      if (!kotlinHtml) {
        throw new Error(`Cached HTML missing for ${mapping.kotlin}`);
      }
      
      console.log(`  Fetching ${mapping.java} from ${javaUrl}...`);
      const javaHtml = await fetchText(javaUrl);
      if (!javaHtml) {
        throw new Error(`Cached HTML missing for ${mapping.java}`);
      }
      
      const kotlinDefinition = await generateKotlinDefinitionFromHtml(mapping.kotlin, kotlinHtml);
      const javaDefinition = await generateJavaDefinitionFromHtml(mapping.java, javaHtml);
      
      const kotlinDefFile = path.join(mappingDir, 'kotlin-definition.kt');
      await fs.writeFile(kotlinDefFile, kotlinDefinition, 'utf-8');
      
      const javaDefFile = path.join(mappingDir, 'java-definition.java');
      await fs.writeFile(javaDefFile, javaDefinition, 'utf-8');
      
      console.log(`  ✓ Generated definitions in ${dirName}`);
    } catch (error) {
      console.error(`  ✗ Failed to process ${mapping.kotlin} <-> ${mapping.java}:`, error);
    }
  }
  
  console.log(`\nDone! Generated ${MAPPED_TYPES.length} type mappings.`);
  
  console.log('\nGenerating mapped-types-details.yaml...');
  await generateMappedTypesDetails();
}

if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

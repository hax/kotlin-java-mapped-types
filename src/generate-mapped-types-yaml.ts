#!/usr/bin/env node
/**
 * Aggregate mapping-details from all directories into mapped-types.yaml
 * Per user requirement: should only include kind and name, no duplicate mappings
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';

interface TypeInfo {
  kind: string;
  name: string;
}

interface TypeMapping {
  kotlin: TypeInfo;
  java: TypeInfo;
}

async function extractTypeInfo(defFile: string): Promise<TypeInfo | null> {
  try {
    const content = await fs.readFile(defFile, 'utf-8');
    const lines = content.split('\n');
    
    let kind = '';
    let name = '';
    let packageName = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Parse package
      const pkgMatch = trimmed.match(/^package\s+([\w.]+)/);
      if (pkgMatch) {
        packageName = pkgMatch[1];
      }
      
      // Parse class/interface for Java
      const javaMatch = trimmed.match(/(?:public\s+)?(?:final\s+)?(class|interface)\s+(\w+)/);
      if (javaMatch) {
        kind = javaMatch[1];
        name = packageName ? `${packageName}.${javaMatch[2]}` : javaMatch[2];
        break;
      }
      
      // Parse class/interface for Kotlin
      const kotlinMatch = trimmed.match(/^(?:open\s+)?(class|interface)\s+(\w+)/);
      if (kotlinMatch) {
        kind = kotlinMatch[1];
        name = packageName ? `${packageName}.${kotlinMatch[2]}` : kotlinMatch[2];
        break;
      }
    }
    
    return kind && name ? { kind, name } : null;
  } catch (error) {
    return null;
  }
}

async function main() {
  const mappingsDir = path.join(process.cwd(), 'mappings');
  const outputFile = path.join(process.cwd(), 'mapped-types.yaml');
  
  console.log('Scanning mapping directories...');
  
  const entries = await fs.readdir(mappingsDir, { withFileTypes: true });
  const mappings: TypeMapping[] = [];
  const seen = new Set<string>();
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const dirPath = path.join(mappingsDir, entry.name);
    const kotlinDefFile = path.join(dirPath, 'kotlin-definition.kt');
    const javaDefFile = path.join(dirPath, 'java-definition.java');
    
    const kotlinInfo = await extractTypeInfo(kotlinDefFile);
    const javaInfo = await extractTypeInfo(javaDefFile);
    
    if (kotlinInfo && javaInfo) {
      // Check for duplicate mappings (same Kotlin-Java pair)
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
  
  // Sort mappings by Kotlin name for consistency
  mappings.sort((a, b) => a.kotlin.name.localeCompare(b.kotlin.name));
  
  const output = yaml.stringify({ mappings });
  await fs.writeFile(outputFile, output, 'utf-8');
  
  console.log(`\nGenerated ${outputFile} with ${mappings.length} unique mappings`);
}

// Run if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { extractTypeInfo };

#!/usr/bin/env node
/**
 * Aggregate mapping-details from all directories into mapped-types.yaml
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';

interface TypeMapping {
  kotlin: {
    kind: string;
    name: string;
  };
  java: {
    kind: string;
    name: string;
  };
}

async function extractTypeInfo(defFile: string): Promise<{ kind: string; name: string } | null> {
  try {
    const content = await fs.readFile(defFile, 'utf-8');
    const lines = content.split('\n');
    
    let kind = '';
    let name = '';
    let packageName = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Parse package
      if (trimmed.startsWith('package ')) {
        packageName = trimmed.match(/package\s+([\w.]+)/)?.[1] || '';
      }
      
      // Parse class/interface for Java
      const javaMatch = trimmed.match(/public\s+(?:final\s+)?(class|interface)\s+(\w+)/);
      if (javaMatch) {
        kind = javaMatch[1];
        name = packageName ? `${packageName}.${javaMatch[2]}` : javaMatch[2];
        break;
      }
      
      // Parse class/interface for Kotlin
      const kotlinMatch = trimmed.match(/^(class|interface)\s+(\w+)/);
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
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const dirPath = path.join(mappingsDir, entry.name);
    const kotlinDefFile = path.join(dirPath, 'kotlin-definition.kt');
    const javaDefFile = path.join(dirPath, 'java-definition.java');
    
    const kotlinInfo = await extractTypeInfo(kotlinDefFile);
    const javaInfo = await extractTypeInfo(javaDefFile);
    
    if (kotlinInfo && javaInfo) {
      mappings.push({
        kotlin: kotlinInfo,
        java: javaInfo
      });
      console.log(`Found mapping: ${kotlinInfo.name} <-> ${javaInfo.name}`);
    }
  }
  
  const output = yaml.stringify({ mappings });
  await fs.writeFile(outputFile, output, 'utf-8');
  
  console.log(`\nGenerated ${outputFile} with ${mappings.length} mappings`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { extractTypeInfo };

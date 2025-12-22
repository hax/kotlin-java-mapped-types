#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import { parseJavaDefinition, parseKotlinDefinition, generateMapping } from './generate-mapping-details.ts';
import { extractTypeInfo } from './utils.ts';
import type { TypeInfo } from './utils.ts';
import { MAPPINGS_DIR, MAPPED_TYPES_DETAILS_FILE } from './config.ts';

interface SimplifiedMapping {
  kotlin: string;
  java: string;
}

interface TypeMappingWithDetails {
  kotlin: TypeInfo;
  java: TypeInfo;
  mappings: SimplifiedMapping[];
}

function simplifySignature(signature: string): string {
  const trimmed = signature.trim();
  
  const kotlinPropertyMatch = trimmed.match(/(?:override\s+)?(?:val|var)\s+(\w+)/);
  if (kotlinPropertyMatch) {
    return kotlinPropertyMatch[1];
  }
  
  const kotlinFuncMatch = trimmed.match(/(?:override\s+)?(?:operator\s+)?fun\s+(\w+)\s*\(([^)]*)\)/);
  if (kotlinFuncMatch) {
    const funcName = kotlinFuncMatch[1];
    const params = kotlinFuncMatch[2];
    
    if (params.trim()) {
      const paramSegments: string[] = [];
      let current = '';
      let depth = 0;
      for (let i = 0; i < params.length; i++) {
        const ch = params[i];
        if (ch === '<') {
          depth++;
        } else if (ch === '>') {
          depth = Math.max(0, depth - 1);
        }
        if (ch === ',' && depth === 0) {
          if (current.trim()) {
            paramSegments.push(current.trim());
          }
          current = '';
          continue;
        }
        current += ch;
      }
      if (current.trim()) {
        paramSegments.push(current.trim());
      }
      const paramNames = paramSegments
        .map(p => {
          const paramMatch = p.match(/(\w+)\s*:/);
          return paramMatch ? paramMatch[1] : '';
        })
        .filter(n => n);
      return `${funcName}(${paramNames.join(', ')})`;
    }
    return `${funcName}()`;
  }
  
  const javaMethodMatch = trimmed.match(/(?:public|protected|private|static|abstract|final|\s)+(?:\w+(?:<[^>]+>)?(?:\[\])?)\s+(\w+)\s*\(([^)]*)\)/);
  if (javaMethodMatch) {
    const methodName = javaMethodMatch[1];
    const params = javaMethodMatch[2];
    
    if (params.trim()) {
      const paramList: string[] = [];
      let depth = 0;
      let currentParam = '';
      
      for (const char of params) {
        if (char === '<') {
          depth++;
          currentParam += char;
        } else if (char === '>') {
          depth--;
          currentParam += char;
        } else if (char === ',' && depth === 0) {
          paramList.push(currentParam);
          currentParam = '';
        } else {
          currentParam += char;
        }
      }
      if (currentParam) {
        paramList.push(currentParam);
      }
      
      const paramNames = paramList.map(p => {
        const trimmedParam = p.trim();
        let depth = 0;
        let lastIdentifierStart = -1;
        let lastIdentifierEnd = -1;
        
        for (let i = 0; i < trimmedParam.length; i++) {
          const char = trimmedParam[i];
          if (char === '<') {
            depth++;
          } else if (char === '>') {
            depth--;
          } else if (depth === 0 && /\w/.test(char)) {
            if (lastIdentifierStart === -1 || /\s/.test(trimmedParam[i - 1] || ' ')) {
              lastIdentifierStart = i;
            }
            lastIdentifierEnd = i;
          }
        }
        
        if (lastIdentifierStart !== -1) {
          const paramName = trimmedParam.substring(lastIdentifierStart, lastIdentifierEnd + 1);
          return paramName.replace(/[\[\]]/g, '');
        }
        return '';
      }).filter(n => n);
      return `${methodName}(${paramNames.join(', ')})`;
    }
    return `${methodName}()`;
  }
  
  return trimmed;
}

function extractMethodName(simplifiedSignature: string): string {
  const match = simplifiedSignature.match(/^(\w+)\(/);
  return match ? match[1] : simplifiedSignature;
}

async function main() {
  console.log('Generating mapped-types-details.yaml with simplified mappings...');
  
  const entries = await fs.readdir(MAPPINGS_DIR, { withFileTypes: true });
  const mappings: TypeMappingWithDetails[] = [];
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
      if (seen.has(key)) continue;
      seen.add(key);
      
      const kotlinContent = await fs.readFile(kotlinDefFile, 'utf-8');
      const javaContent = await fs.readFile(javaDefFile, 'utf-8');
      
      const kotlinType = parseKotlinDefinition(kotlinContent);
      const javaType = parseJavaDefinition(javaContent);
      const detailedMappings = generateMapping(javaType, kotlinType);
      
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
  
  const output = yaml.stringify({ mappings });
  await fs.writeFile(MAPPED_TYPES_DETAILS_FILE, output, 'utf-8');
  
  console.log(`\nGenerated ${MAPPED_TYPES_DETAILS_FILE} with ${mappings.length} type mappings`);
}

if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { simplifySignature, main as generateMappedTypesDetails };

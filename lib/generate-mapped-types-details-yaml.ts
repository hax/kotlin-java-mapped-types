#!/usr/bin/env node
/**
 * Generate mapped-types-details.yaml with simplified mapping names
 * Similar to mapped-types.yaml but includes a mappings list with method/property names
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
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

/**
 * Extract simplified mapping name from full signature
 * For properties: extract name (e.g., "val length: Int" -> "length")
 * For methods: extract name and parameters (e.g., "fun get(index: Int): Char" -> "get(index)")
 */
function simplifySignature(signature: string): string {
  const trimmed = signature.trim();
  
  // For Kotlin properties (val/var)
  const kotlinPropertyMatch = trimmed.match(/(?:override\s+)?(?:val|var)\s+(\w+)/);
  if (kotlinPropertyMatch) {
    return kotlinPropertyMatch[1];
  }
  
  // For Kotlin functions
  const kotlinFuncMatch = trimmed.match(/(?:override\s+)?(?:operator\s+)?fun\s+(\w+)\s*\(([^)]*)\)/);
  if (kotlinFuncMatch) {
    const funcName = kotlinFuncMatch[1];
    const params = kotlinFuncMatch[2];
    
    // Extract parameter names only (no types)
    if (params.trim()) {
      // Split Kotlin parameters while handling generic types with commas inside angle brackets
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
  
  // For Java methods
  const javaMethodMatch = trimmed.match(/(?:public|protected|private|static|abstract|final|\s)+(?:\w+(?:<[^>]+>)?(?:\[\])?)\s+(\w+)\s*\(([^)]*)\)/);
  if (javaMethodMatch) {
    const methodName = javaMethodMatch[1];
    const params = javaMethodMatch[2];
    
    // Extract parameter names only (no types)
    if (params.trim()) {
      // Split parameters respecting angle brackets
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
        
        // Handle complex generic types like Map<? extends K, ? extends V> m
        // Strategy: find the last identifier that's not inside angle brackets
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
          // Extract the identifier and remove array brackets
          const paramName = trimmedParam.substring(lastIdentifierStart, lastIdentifierEnd + 1);
          return paramName.replace(/[\[\]]/g, '');
        }
        return '';
      }).filter(n => n);
      return `${methodName}(${paramNames.join(', ')})`;
    }
    return `${methodName}()`;
  }
  
  // Fallback: return as-is
  return trimmed;
}

/**
 * Extract the method name from a simplified signature
 * e.g., "add(index, element)" -> "add"
 */
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
    const mappingDetailsFile = path.join(dirPath, 'mapping-details.yaml');
    
    const kotlinInfo = await extractTypeInfo(kotlinDefFile);
    const javaInfo = await extractTypeInfo(javaDefFile);
    
    if (kotlinInfo && javaInfo) {
      // Check for duplicate mappings (same Kotlin-Java pair)
      const key = `${kotlinInfo.name}::${javaInfo.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      
      // Read and parse mapping-details.yaml
      const simplifiedMappings: SimplifiedMapping[] = [];
      try {
        const mappingDetailsContent = await fs.readFile(mappingDetailsFile, 'utf-8');
        const detailedMappings = yaml.parse(mappingDetailsContent) as Array<{ kotlin: string; java: string }>;
        
        // Simplify each mapping and deduplicate by method name
        const seenMethodNames = new Set<string>();
        for (const mapping of detailedMappings) {
          const kotlinSimplified = simplifySignature(mapping.kotlin);
          const javaSimplified = simplifySignature(mapping.java);
          
          // Extract method name for deduplication (per user's request to omit overloads)
          const kotlinMethodName = extractMethodName(kotlinSimplified);
          
          // Deduplicate by method name (keep only first occurrence)
          if (!seenMethodNames.has(kotlinMethodName)) {
            seenMethodNames.add(kotlinMethodName);
            simplifiedMappings.push({
              kotlin: kotlinSimplified,
              java: javaSimplified
            });
          }
        }
      } catch (error) {
        console.warn(`  Warning: Could not read mapping details for ${entry.name}`);
      }
      
      mappings.push({
        kotlin: kotlinInfo,
        java: javaInfo,
        mappings: simplifiedMappings
      });
      
      console.log(`Found mapping: ${kotlinInfo.name} <-> ${javaInfo.name} (${simplifiedMappings.length} mappings)`);
    }
  }
  
  // Sort mappings by Kotlin name for consistency
  mappings.sort((a, b) => a.kotlin.name.localeCompare(b.kotlin.name));
  
  const output = yaml.stringify({ mappings });
  await fs.writeFile(MAPPED_TYPES_DETAILS_FILE, output, 'utf-8');
  
  console.log(`\nGenerated ${MAPPED_TYPES_DETAILS_FILE} with ${mappings.length} type mappings`);
}

// Run if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { simplifySignature, main as generateMappedTypesDetails };

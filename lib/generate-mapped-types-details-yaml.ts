#!/usr/bin/env node
/**
 * Generate mapped-types-details.yaml with simplified mapping names
 * Similar to mapped-types.yaml but includes a mappings list with method/property names
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';

interface TypeInfo {
  kind: string;
  name: string;
}

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
      const paramNames = params.split(',').map(p => {
        const paramMatch = p.trim().match(/(\w+)\s*:/);
        return paramMatch ? paramMatch[1] : '';
      }).filter(n => n);
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
      const paramNames = params.split(',').map(p => {
        const parts = p.trim().split(/\s+/);
        // Last part before array brackets is the parameter name
        const lastPart = parts[parts.length - 1];
        return lastPart.replace(/[\[\]]/g, '');
      }).filter(n => n);
      return `${methodName}(${paramNames.join(', ')})`;
    }
    return `${methodName}()`;
  }
  
  // Fallback: return as-is
  return trimmed;
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
  const outputFile = path.join(process.cwd(), 'mapped-types-details.yaml');
  
  console.log('Generating mapped-types-details.yaml with simplified mappings...');
  
  const entries = await fs.readdir(mappingsDir, { withFileTypes: true });
  const mappings: TypeMappingWithDetails[] = [];
  const seen = new Set<string>();
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const dirPath = path.join(mappingsDir, entry.name);
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
        
        // Simplify each mapping
        const seenMappings = new Set<string>();
        for (const mapping of detailedMappings) {
          const kotlinSimplified = simplifySignature(mapping.kotlin);
          const javaSimplified = simplifySignature(mapping.java);
          
          // Deduplicate mappings
          const mappingKey = `${kotlinSimplified}::${javaSimplified}`;
          if (!seenMappings.has(mappingKey)) {
            seenMappings.add(mappingKey);
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
  await fs.writeFile(outputFile, output, 'utf-8');
  
  console.log(`\nGenerated ${outputFile} with ${mappings.length} type mappings`);
}

// Run if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { simplifySignature, main as generateMappedTypesDetails };

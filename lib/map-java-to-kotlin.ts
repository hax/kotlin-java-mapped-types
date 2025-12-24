/**
 * Map Java type definitions to Kotlin types in d.ts format
 * using TypeScript parser for AST manipulation.
 */

import { parseJavaDef, javaTypeToDTS } from './mappings.ts';
import { transformTypesInAST, type TypeMapping } from './apply-type-mappings.ts';
import { MAPPED_TYPES_FILE } from './config.ts';
import * as ts from 'typescript';
import { readFileSync } from 'fs';

export interface MappingResult {
  dts: string;
  appliedMappings: Array<{ from: string; to: string; path: string }>;
}

export interface MappingOptions {
  mapPrimitives?: boolean; // Default: false - don't map primitive types
}

interface MappedTypeEntry {
  javaType: string;
  kotlinType: string;
  memberMappings?: Array<{
    javaSignature: string;
    kotlinSignature: string;
  }>;
}

/**
 * Build a map from Java types to Kotlin types from mapped-types.json
 */
export function buildTypeMappings(options: MappingOptions = {}): Map<string, TypeMapping> {
  const { mapPrimitives = false } = options;
  
  // Read from mapped-types.json
  const jsonPath = MAPPED_TYPES_FILE + '.json';
  const jsonContent = readFileSync(jsonPath, 'utf-8');
  const mappedTypes: MappedTypeEntry[] = JSON.parse(jsonContent);
  
  const typeMap = new Map<string, TypeMapping>();
  
  const primitiveTypes = new Set([
    'boolean', 'byte', 'short', 'int', 'long', 'char', 'float', 'double',
    'Boolean', 'Byte', 'Short', 'Integer', 'Long', 'Character', 'Float', 'Double'
  ]);
  
  for (const entry of mappedTypes) {
    const { javaType, kotlinType } = entry;
    
    // Skip primitive types if mapPrimitives is false
    if (!mapPrimitives && primitiveTypes.has(javaType)) {
      continue;
    }
    
    // Detect nullability suffix
    let nullable: '?' | '!' | '' = '';
    let cleanKotlinType = kotlinType;
    
    if (kotlinType.endsWith('?')) {
      nullable = '?';
      cleanKotlinType = kotlinType.slice(0, -1);
    } else if (kotlinType.endsWith('!')) {
      nullable = '!';
      cleanKotlinType = kotlinType.slice(0, -1);
    }
    
    // Store both with and without generic parameters
    typeMap.set(javaType, { kotlinType: cleanKotlinType, nullable });
    
    // Also store the base type without generics
    const javaBaseType = javaType.replace(/<.+>$/, '').trim();
    typeMap.set(javaBaseType, { kotlinType: cleanKotlinType, nullable });
  }
  
  return typeMap;
}

/**
 * Convert Java definition to d.ts format
 */
export function javaDefToDTS(javaDefContent: string): string {
  const javaParsed = parseJavaDef(javaDefContent);
  return javaTypeToDTS(javaParsed);
}

/**
 * Apply Kotlin type mappings to a d.ts string
 */
export function applyKotlinMappings(dtsContent: string, options: MappingOptions = {}): MappingResult {
  // Build type mappings
  const typeMap = buildTypeMappings(options);
  
  // Parse the d.ts with TypeScript
  const sourceFile = ts.createSourceFile(
    'temp.d.ts',
    dtsContent,
    ts.ScriptTarget.Latest,
    true
  );
  
  // Transform the AST to apply type mappings
  const { transformed, appliedMappings } = transformTypesInAST(sourceFile, typeMap);
  
  // Print the transformed AST back to string
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const mappedDTS = printer.printFile(transformed);
  
  return {
    dts: mappedDTS,
    appliedMappings
  };
}

/**
 * Main mapping function: Map a Java definition to d.ts format with Kotlin types
 */
export function mapJavaToKotlin(javaDefContent: string, options: MappingOptions = {}): MappingResult {
  // Convert Java definition to d.ts
  const dtsContent = javaDefToDTS(javaDefContent);
  
  // Apply Kotlin type mappings
  return applyKotlinMappings(dtsContent, options);
}

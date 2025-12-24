/**
 * Map Java type definitions to Kotlin types in d.ts format
 * using TypeScript parser for AST manipulation.
 */

import { parseJavaDef, javaTypeToDTS } from './mappings.ts';
import { getMappedTypes } from './get-mapped-types.ts';
import { transformTypesInAST, type TypeMapping } from './ast-transform.ts';
import * as ts from 'typescript';

export interface MappingResult {
  dts: string;
  unmappedTypes: string[];
  appliedMappings: Array<{ from: string; to: string }>;
}

/**
 * Build a map from Java types to Kotlin types
 */
export async function buildTypeMappings(): Promise<Map<string, TypeMapping>> {
  const mappedTypes = await getMappedTypes();
  const typeMap = new Map<string, TypeMapping>();
  
  for (const [javaType, kotlinType] of mappedTypes) {
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
export async function applyKotlinMappings(dtsContent: string): Promise<MappingResult> {
  // Build type mappings
  const typeMap = await buildTypeMappings();
  
  // Parse the d.ts with TypeScript
  const sourceFile = ts.createSourceFile(
    'temp.d.ts',
    dtsContent,
    ts.ScriptTarget.Latest,
    true
  );
  
  // Transform the AST to apply type mappings
  const { transformed, appliedMappings, unmappedTypes } = transformTypesInAST(sourceFile, typeMap);
  
  // Print the transformed AST back to string
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const mappedDTS = printer.printFile(transformed);
  
  return {
    dts: mappedDTS,
    unmappedTypes,
    appliedMappings
  };
}

/**
 * Main mapping function: Map a Java definition to d.ts format with Kotlin types
 */
export async function mapJavaToKotlin(javaDefContent: string): Promise<MappingResult> {
  // Convert Java definition to d.ts
  const dtsContent = javaDefToDTS(javaDefContent);
  
  // Apply Kotlin type mappings
  return await applyKotlinMappings(dtsContent);
}

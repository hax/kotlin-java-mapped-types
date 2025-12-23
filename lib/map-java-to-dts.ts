/**
 * Map Java type definitions to TypeScript declaration format (.d.ts)
 * based on the official Kotlin-Java type mapping relationships.
 * 
 * This module:
 * 1. Reads a Java definition file
 * 2. Converts it to d.ts format
 * 3. Applies type mappings based on Kotlin documentation
 * 4. Outputs a d.ts representation of the mapped type
 */

import { parseJavaDef, javaTypeToDTS, type ParsedType, type ParsedMember } from './mappings.ts';
import { getMappedTypes } from './get-mapped-types.ts';
import { readFile } from 'fs/promises';

export interface MappingResult {
  dts: string;
  unmappedTypes: string[];
  appliedMappings: Array<{ from: string; to: string }>;
}

/**
 * Build a map from Java types to Kotlin types (for d.ts output)
 */
export async function buildTypeMappings(): Promise<Map<string, { kotlinType: string; nullable: '?' | '!' | '' }>> {
  const mappedTypes = await getMappedTypes();
  const typeMap = new Map<string, { kotlinType: string; nullable: '?' | '!' | '' }>();
  
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
 * Convert a Java type name to its mapped TypeScript representation
 * 
 * For nullable types (X?), convert to ?X in d.ts
 * For platform types (X!), convert to X in d.ts
 */
function mapJavaTypeToDTS(
  javaType: string,
  typeMap: Map<string, { kotlinType: string; nullable: '?' | '!' | '' }>,
  packageContext?: string
): { mapped: string; isUnmapped: boolean } {
  // First try direct lookup
  const directMapping = typeMap.get(javaType);
  if (directMapping) {
    const { kotlinType, nullable } = directMapping;
    // For nullable types (?), prefix with ? in d.ts
    const result = nullable === '?' ? `?${kotlinType}` : kotlinType;
    return { mapped: result, isUnmapped: false };
  }
  
  // Try with package context for unqualified names
  if (packageContext && !javaType.includes('.')) {
    const qualifiedType = `${packageContext}.${javaType}`;
    const qualifiedMapping = typeMap.get(qualifiedType);
    if (qualifiedMapping) {
      const { kotlinType, nullable } = qualifiedMapping;
      const result = nullable === '?' ? `?${kotlinType}` : kotlinType;
      return { mapped: result, isUnmapped: false };
    }
  }
  
  // Handle generic types
  const genericMatch = javaType.match(/^([^<]+)(<.+>)?$/);
  if (genericMatch) {
    const baseType = genericMatch[1].trim();
    const generics = genericMatch[2] || '';
    
    // Try to map base type
    let mapping = typeMap.get(baseType);
    if (!mapping && packageContext && !baseType.includes('.')) {
      const qualifiedBase = `${packageContext}.${baseType}`;
      mapping = typeMap.get(qualifiedBase);
    }
    
    if (mapping) {
      const { kotlinType, nullable } = mapping;
      
      // Convert generic parameters recursively
      if (generics) {
        const convertedGenerics = convertGenerics(generics, typeMap, packageContext);
        const result = nullable === '?' ? `?${kotlinType}${convertedGenerics}` : `${kotlinType}${convertedGenerics}`;
        return { mapped: result, isUnmapped: false };
      }
      
      const result = nullable === '?' ? `?${kotlinType}` : kotlinType;
      return { mapped: result, isUnmapped: false };
    }
  }
  
  return { mapped: javaType, isUnmapped: true };
}

/**
 * Convert generic type parameters
 */
function convertGenerics(
  generics: string,
  typeMap: Map<string, { kotlinType: string; nullable: '?' | '!' | '' }>,
  packageContext?: string
): string {
  // Parse generic parameters respecting nested brackets
  const params = parseGenericParams(generics);
  const convertedParams = params.map(param => {
    const { mapped } = mapJavaTypeToDTS(param.trim(), typeMap, packageContext);
    return mapped;
  });
  
  return '<' + convertedParams.join(', ') + '>';
}

/**
 * Parse generic parameters from a string like "<K, V>" or "<K, V<T>>"
 */
function parseGenericParams(generics: string): string[] {
  // Remove outer brackets
  const inner = generics.slice(1, -1);
  const params: string[] = [];
  let currentParam = '';
  let depth = 0;
  
  for (const char of inner) {
    if (char === '<') {
      depth++;
      currentParam += char;
    } else if (char === '>') {
      depth--;
      currentParam += char;
    } else if (char === ',' && depth === 0) {
      if (currentParam.trim()) {
        params.push(currentParam.trim());
      }
      currentParam = '';
    } else {
      currentParam += char;
    }
  }
  
  if (currentParam.trim()) {
    params.push(currentParam.trim());
  }
  
  return params;
}

/**
 * Main mapping function: Map a Java definition to d.ts format
 */
export async function mapJavaToKotlin(javaDefContent: string): Promise<MappingResult> {
  // Parse the Java definition
  const javaParsed = parseJavaDef(javaDefContent);
  
  // Convert to initial d.ts
  const initialDTS = javaTypeToDTS(javaParsed);
  
  // Build type mappings
  const typeMap = await buildTypeMappings();
  
  // Apply type mappings to the d.ts
  const unmappedTypes: string[] = [];
  const appliedMappings: Array<{ from: string; to: string }> = [];
  
  // Map type name
  const javaFullType = `${javaParsed.package}.${javaParsed.name}`;
  const { mapped: mappedTypeName, isUnmapped } = mapJavaTypeToDTS(javaFullType, typeMap, javaParsed.package);
  
  if (!isUnmapped && mappedTypeName !== javaFullType) {
    appliedMappings.push({ from: javaFullType, to: mappedTypeName });
  }
  
  // For now, output the d.ts with a comment about the mapping
  const comment = `// Mapped from: ${javaFullType}\n// Kotlin equivalent: ${mappedTypeName}\n\n`;
  const dts = comment + initialDTS;
  
  return {
    dts,
    unmappedTypes,
    appliedMappings
  };
}

/**
 * Convert Java type definitions to Kotlin type definitions based on mapping relationships.
 * 
 * This module:
 * 1. Reads a Java definition file
 * 2. Converts type names based on known mappings
 * 3. Converts superclasses and interfaces
 * 4. Converts methods and properties according to member mappings
 * 5. Outputs a Kotlin definition
 */

import { parseJavaDef, parseKotlinDef, calcMapping, type ParsedMember } from './mappings.ts';
import { getMappedTypes, type MappedType } from './get-mapped-types.ts';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { DEFS_DIR } from './config.ts';

export interface ConversionResult {
  kotlinDef: string;
  unmappedTypes: string[];
  unmappedMembers: ParsedMember[];
}

/**
 * Build a map from Java types to Kotlin types
 */
export async function buildTypeMappings(): Promise<Map<string, string>> {
  const mappedTypes = await getMappedTypes();
  const typeMap = new Map<string, string>();
  
  for (const [javaType, kotlinType] of mappedTypes) {
    // Remove nullability suffix from Kotlin type for the mapping
    const cleanKotlinType = kotlinType.replace(/!$/, '').replace(/\?$/, '');
    
    // Store both with and without generic parameters
    typeMap.set(javaType, cleanKotlinType);
    
    // Also store the base type without generics
    const javaBaseType = javaType.replace(/<.+>$/, '').trim();
    const kotlinBaseType = cleanKotlinType.replace(/<.+>$/, '').trim();
    typeMap.set(javaBaseType, kotlinBaseType);
  }
  
  return typeMap;
}

/**
 * Convert a Java type name to its Kotlin equivalent
 */
export function convertJavaTypeToKotlin(
  javaType: string, 
  typeMap: Map<string, string>,
  packageContext?: string
): string {
  // First try direct lookup
  const directMapping = typeMap.get(javaType);
  if (directMapping) {
    return directMapping;
  }
  
  // Try with package context for unqualified names
  if (packageContext && !javaType.includes('.')) {
    const qualifiedType = `${packageContext}.${javaType}`;
    const qualifiedMapping = typeMap.get(qualifiedType);
    if (qualifiedMapping) {
      return qualifiedMapping;
    }
  }
  
  // Handle generic types
  const genericMatch = javaType.match(/^([^<]+)(<.+>)?$/);
  if (genericMatch) {
    const baseType = genericMatch[1].trim();
    const generics = genericMatch[2] || '';
    
    // Convert base type (with package context)
    let kotlinBaseType = typeMap.get(baseType);
    if (!kotlinBaseType && packageContext && !baseType.includes('.')) {
      const qualifiedBase = `${packageContext}.${baseType}`;
      kotlinBaseType = typeMap.get(qualifiedBase);
    }
    kotlinBaseType = kotlinBaseType || baseType;
    
    // Convert generic parameters recursively
    if (generics) {
      const convertedGenerics = convertGenerics(generics, typeMap, packageContext);
      return kotlinBaseType + convertedGenerics;
    }
    
    return kotlinBaseType;
  }
  
  return javaType;
}

/**
 * Convert generic type parameters
 */
function convertGenerics(generics: string, typeMap: Map<string, string>, packageContext?: string): string {
  // Simple implementation - can be enhanced for complex nested generics
  let result = generics;
  for (const [javaType, kotlinType] of typeMap) {
    result = result.replace(new RegExp(`\\b${escapeRegex(javaType)}\\b`, 'g'), kotlinType);
  }
  
  // Also try with package context for unqualified names in generics
  if (packageContext) {
    const typePattern = /\b([A-Z]\w+)\b/g;
    result = result.replace(typePattern, (match) => {
      const qualified = `${packageContext}.${match}`;
      return typeMap.get(qualified) || match;
    });
  }
  
  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Split a comma-separated list of types, respecting generic brackets
 */
function splitTypesRespectingGenerics(typeList: string): string[] {
  const types: string[] = [];
  let currentType = '';
  let depth = 0;
  
  for (let i = 0; i < typeList.length; i++) {
    const char = typeList[i];
    
    if (char === '<') {
      depth++;
      currentType += char;
    } else if (char === '>') {
      depth--;
      currentType += char;
    } else if (char === ',' && depth === 0) {
      if (currentType.trim()) {
        types.push(currentType.trim());
      }
      currentType = '';
    } else {
      currentType += char;
    }
  }
  
  if (currentType.trim()) {
    types.push(currentType.trim());
  }
  
  return types;
}

/**
 * Load member mappings between Java and Kotlin types
 */
export async function loadMemberMappings(
  javaType: string,
  kotlinType: string
): Promise<Map<string, ParsedMember>> {
  // Find the directory containing the definitions
  const dirname = javaType.replace(/\[\]$/, '');
  const defDir = join(DEFS_DIR, dirname);
  
  try {
    const javaDefFile = join(defDir, 'def.java');
    const javaContent = await readFile(javaDefFile, 'utf-8');
    const javaParsed = parseJavaDef(javaContent);
    
    // Find the Kotlin definition file
    // The file might be named with the full qualified name
    const kotlinParts = kotlinType.split('.');
    if (kotlinParts.length === 0) {
      return new Map();
    }
    const kotlinSimpleName = kotlinParts[kotlinParts.length - 1];
    let kotlinDefFile = join(defDir, `${kotlinType}.kt`);
    
    // Try to read the file
    let kotlinContent: string;
    try {
      kotlinContent = await readFile(kotlinDefFile, 'utf-8');
    } catch {
      // File not found with full name, try to find any .kt file matching the simple name
      const files = await readdir(defDir);
      const ktFile = files.find(f => f.endsWith('.kt') && f.endsWith(`${kotlinSimpleName}.kt`));
      if (!ktFile) {
        return new Map();
      }
      kotlinDefFile = join(defDir, ktFile);
      kotlinContent = await readFile(kotlinDefFile, 'utf-8');
    }
    
    const kotlinParsed = parseKotlinDef(kotlinContent);
    
    // Calculate mappings
    const mappings = calcMapping(javaParsed, kotlinParsed);
    
    // Build a map from Java member name to Kotlin member
    const memberMap = new Map<string, ParsedMember>();
    for (const [javaMember, kotlinMember] of mappings) {
      memberMap.set(javaMember.name, kotlinMember);
    }
    
    return memberMap;
  } catch (error) {
    // Log the error for debugging but don't fail the conversion
    if (process.env.DEBUG) {
      console.error(`Failed to load member mappings for ${javaType}: ${error}`);
    }
    // Return empty map if definitions not found or parsing fails
    return new Map();
  }
}

/**
 * Convert a Java member to a Kotlin member
 */
export function convertJavaMemberToKotlin(
  javaMember: ParsedMember,
  memberMap: Map<string, ParsedMember>,
  typeMap: Map<string, string>
): ParsedMember | null {
  // Check if we have a direct mapping
  const kotlinMember = memberMap.get(javaMember.name);
  if (kotlinMember) {
    return kotlinMember;
  }
  
  // Try to convert based on common patterns
  if (javaMember.kind === 'method') {
    // Check if it's a getter/setter that should become a property
    const propertyName = extractPropertyName(javaMember.name);
    if (propertyName) {
      const kotlinProp = memberMap.get(propertyName);
      if (kotlinProp && kotlinProp.kind === 'property') {
        return kotlinProp;
      }
    }
    
    // Convert method signature
    return convertMethodSignature(javaMember, typeMap);
  }
  
  return null;
}

/**
 * Extract property name from getter/setter method name
 */
function extractPropertyName(methodName: string): string | null {
  if (methodName.startsWith('get') && methodName.length > 3) {
    return methodName[3].toLowerCase() + methodName.slice(4);
  }
  if (methodName.startsWith('is') && methodName.length > 2) {
    return methodName[2].toLowerCase() + methodName.slice(3);
  }
  if (methodName.startsWith('set') && methodName.length > 3) {
    return methodName[3].toLowerCase() + methodName.slice(4);
  }
  return null;
}

/**
 * Convert a method signature from Java to Kotlin
 */
function convertMethodSignature(javaMember: ParsedMember, typeMap: Map<string, string>): ParsedMember {
  // Parse the Java method signature
  const typeMatch = javaMember.type.match(/^(\([^)]*\)):\s*(.+)$/);
  if (!typeMatch) {
    return javaMember;
  }
  
  const params = typeMatch[1];
  const returnType = typeMatch[2].trim();
  
  // Convert parameter types
  const convertedParams = convertMethodParams(params, typeMap);
  
  // Convert return type
  const convertedReturnType = convertJavaTypeToKotlin(returnType, typeMap);
  
  // Build Kotlin method signature
  const kotlinType = `${convertedParams}: ${convertedReturnType}`;
  
  return {
    kind: 'method',
    name: javaMember.name,
    modifiers: convertModifiers(javaMember.modifiers),
    type: kotlinType
  };
}

/**
 * Convert Java modifiers to Kotlin modifiers
 */
function convertModifiers(javaModifiers: string[]): string[] {
  const kotlinModifiers: string[] = [];
  
  for (const mod of javaModifiers) {
    switch (mod) {
      case 'public':
        // public is default in Kotlin, usually omitted
        kotlinModifiers.push('public');
        break;
      case 'private':
      case 'protected':
        kotlinModifiers.push(mod);
        break;
      case 'static':
        // Static members go in companion object in Kotlin
        // We'll keep track but handle differently
        break;
      case 'final':
        // final is default in Kotlin, no need to add
        break;
      case 'abstract':
        kotlinModifiers.push('abstract');
        break;
      default:
        // Keep other modifiers
        break;
    }
  }
  
  return kotlinModifiers;
}

/**
 * Convert method parameters from Java to Kotlin syntax
 */
function convertMethodParams(params: string, typeMap: Map<string, string>): string {
  // Simple implementation - just convert types in the parameter list
  let result = params;
  for (const [javaType, kotlinType] of typeMap) {
    result = result.replace(new RegExp(`\\b${escapeRegex(javaType)}\\b`, 'g'), kotlinType);
  }
  return result;
}

/**
 * Main conversion function: Convert a Java definition to Kotlin
 */
export async function convertJavaToKotlin(javaDefContent: string): Promise<ConversionResult> {
  // Parse the Java definition
  const javaParsed = parseJavaDef(javaDefContent);
  
  // Build type mappings
  const typeMap = await buildTypeMappings();
  
  // Convert package name - for now, keep it as is or map java.* to kotlin.*
  const kotlinPackage = javaParsed.package.startsWith('java.lang') 
    ? 'kotlin' 
    : javaParsed.package.startsWith('java.util')
    ? 'kotlin.collections'
    : javaParsed.package;
  
  // Convert type name
  const javaFullType = `${javaParsed.package}.${javaParsed.name}`;
  const convertedType = convertJavaTypeToKotlin(javaFullType, typeMap, javaParsed.package);
  const kotlinTypeName = convertedType.split('.').pop() || javaParsed.name;
  
  // Convert superclasses and interfaces
  const kotlinSuper: string[] = [];
  const unmappedTypes: string[] = [];
  
  for (const superType of javaParsed.super) {
    // Parse types accounting for generics (don't split on commas inside <>)
    const types = splitTypesRespectingGenerics(superType);
    
    for (const type of types) {
      const converted = convertJavaTypeToKotlin(type, typeMap, javaParsed.package);
      kotlinSuper.push(converted);
      
      // Check if conversion happened (ignoring generic parameters for the check)
      const baseType = type.replace(/<.+>$/, '').trim();
      const convertedBaseType = converted.replace(/<.+>$/, '').trim();
      if (convertedBaseType === baseType && !typeMap.has(baseType)) {
        const qualifiedBaseType = `${javaParsed.package}.${baseType}`;
        if (!typeMap.has(qualifiedBaseType)) {
          unmappedTypes.push(type);
        }
      }
    }
  }
  
  // Try to load member mappings
  const memberMap = await loadMemberMappings(javaFullType, kotlinTypeName);
  
  // Convert members
  const kotlinMembers: string[] = [];
  const unmappedMembers: ParsedMember[] = [];
  
  for (const javaMember of javaParsed.members) {
    // Skip static members for now (they would go in companion object)
    if (javaMember.modifiers.includes('static')) {
      continue;
    }
    
    // Skip constructors for now
    if (javaMember.kind === 'constructor') {
      continue;
    }
    
    const kotlinMember = convertJavaMemberToKotlin(javaMember, memberMap, typeMap);
    if (kotlinMember) {
      const memberStr = formatKotlinMember(kotlinMember);
      kotlinMembers.push(memberStr);
    } else {
      unmappedMembers.push(javaMember);
    }
  }
  
  // Build the Kotlin definition
  const superClause = kotlinSuper.length > 0 ? ` : ${kotlinSuper.join(', ')}` : '';
  const membersStr = kotlinMembers.length > 0 
    ? '\n    ' + kotlinMembers.join('\n    ') + '\n'
    : '';
  
  const kotlinDef = `// Converted from Java definition
// Original: ${javaParsed.package}.${javaParsed.name}

package ${kotlinPackage}

${javaParsed.kind} ${kotlinTypeName}${superClause} {${membersStr}}
`;
  
  return {
    kotlinDef,
    unmappedTypes,
    unmappedMembers
  };
}

/**
 * Format a Kotlin member as a string
 */
function formatKotlinMember(member: ParsedMember): string {
  const mods = member.modifiers.length > 0 ? member.modifiers.join(' ') + ' ' : '';
  
  if (member.kind === 'property') {
    // Property format: modifiers val/var name: Type
    // The type already includes the colon, so just append it
    const typeStr = member.type.startsWith(':') ? member.type : `: ${member.type}`;
    return `${mods}val ${member.name}${typeStr}`;
  } else if (member.kind === 'method') {
    // Method format: modifiers fun name(params): ReturnType
    return `${mods}fun ${member.name}${member.type}`;
  }
  
  return '';
}

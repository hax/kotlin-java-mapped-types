#!/usr/bin/env node
/**
 * Fetch Kotlin type definitions
 * Primary: from official Kotlin API documentation
 * Fallback: from local type database
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { KOTLIN_TYPES } from './kotlin-types-db.js';
import { getKotlinTypeInfo } from './fetch-kotlin-api.js';

/**
 * Generate Kotlin type definition from fetched or cached data
 */
async function generateKotlinDefinition(kotlinType: string): Promise<string> {
  // Try to fetch from official documentation first
  console.log(`Attempting to fetch ${kotlinType} from official Kotlin API docs...`);
  const fetchedInfo = await getKotlinTypeInfo(kotlinType);
  
  // Use fetched info if available, otherwise fall back to database
  const typeInfo = fetchedInfo || KOTLIN_TYPES[kotlinType];
  
  if (!typeInfo) {
    // Last resort: generate fallback definition
    return generateFallbackDefinition(kotlinType);
  }
  
  const parts = kotlinType.split('.');
  const className = parts[parts.length - 1];
  
  // Detect package vs nested classes
  let packageName = '';
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i][0] === parts[i][0].toUpperCase()) {
      // Found a parent class
      break;
    }
    packageName += (packageName ? '.' : '') + parts[i];
  }
  
  let definition = '';
  
  if (packageName) {
    definition += `package ${packageName}\n\n`;
  }
  
  // Generate class/interface declaration
  const modifiers = typeInfo.modifiers.join(' ');
  const kind = typeInfo.kind;
  
  let declaration = modifiers ? `${modifiers} ${kind} ${className}` : `${kind} ${className}`;
  
  const superTypes: string[] = [];
  if (typeInfo.extends) {
    superTypes.push(typeInfo.extends);
  }
  if (typeInfo.implements) {
    superTypes.push(...typeInfo.implements);
  }
  
  if (superTypes.length > 0) {
    declaration += ` : ${superTypes.join(', ')}`;
  }
  
  definition += `${declaration} {\n`;
  
  // Add property signatures
  for (const prop of typeInfo.properties) {
    const propModifiers = prop.modifiers.filter(m => m !== 'override').join(' ');
    const modStr = propModifiers ? `${propModifiers} ` : '';
    const overrideStr = prop.modifiers.includes('override') ? 'override ' : '';
    definition += `    ${overrideStr}${modStr}val ${prop.name}: ${prop.type}\n`;
  }
  
  // Add function signatures
  for (const func of typeInfo.functions) {
    const funcModifiers = func.modifiers.filter(m => m !== 'override').join(' ');
    const modStr = funcModifiers ? `${funcModifiers} ` : '';
    const overrideStr = func.modifiers.includes('override') ? 'override ' : '';
    const params = func.parameters.join(', ');
    definition += `    ${overrideStr}${modStr}fun ${func.name}(${params}): ${func.returnType}\n`;
  }
  
  definition += `}\n`;
  
  return definition;
}

function generateFallbackDefinition(kotlinType: string): string {
  const parts = kotlinType.split('.');
  const className = parts[parts.length - 1];
  let packageName = '';
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i][0] === parts[i][0].toUpperCase()) {
      break;
    }
    packageName += (packageName ? '.' : '') + parts[i];
  }
  
  let definition = '';
  if (packageName) {
    definition += `package ${packageName}\n\n`;
  }
  
  definition += `interface ${className} {\n`;
  definition += `    // Type not in database - signatures need to be added\n`;
  definition += `}\n`;
  
  return definition;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: fetch-kotlin-definition <kotlin.type.Name>');
    process.exit(1);
  }
  
  const kotlinType = args[0];
  const definition = await generateKotlinDefinition(kotlinType);
  console.log(definition);
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateKotlinDefinition };

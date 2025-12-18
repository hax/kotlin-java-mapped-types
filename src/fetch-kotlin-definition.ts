#!/usr/bin/env node
/**
 * Fetch Kotlin type definitions from official Kotlin API documentation
 */

import { getKotlinTypeInfo } from './fetch-kotlin-api.js';

/**
 * Generate Kotlin type definition from fetched data
 */
async function generateKotlinDefinition(kotlinType: string): Promise<string> {
  // Fetch from official documentation
  console.log(`Fetching ${kotlinType} from official Kotlin API docs...`);
  const typeInfo = await getKotlinTypeInfo(kotlinType);
  
  if (!typeInfo) {
    throw new Error(`Failed to fetch type information for ${kotlinType}`);
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

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateKotlinDefinition };

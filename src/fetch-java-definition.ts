#!/usr/bin/env node
/**
 * Fetch Java type definitions from official Android API documentation
 */

import { getJavaTypeInfo } from './fetch-java-api.ts';

/**
 * Generate Java type definition from fetched data
 */
async function generateJavaDefinition(javaType: string): Promise<string> {
  // Fetch from official documentation
  console.log(`Fetching ${javaType} from official Android API docs...`);
  const typeInfo = await getJavaTypeInfo(javaType);
  
  if (!typeInfo) {
    throw new Error(`Failed to fetch type information for ${javaType}`);
  }
  
  const parts = javaType.split('.');
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
    definition += `package ${packageName};\n\n`;
  }
  
  // Generate class/interface declaration
  const modifiers = typeInfo.modifiers.join(' ');
  const kind = typeInfo.kind;
  
  let declaration = `${modifiers} ${kind} ${className}`;
  
  if (typeInfo.extends) {
    declaration += ` extends ${typeInfo.extends}`;
  }
  
  if (typeInfo.implements && typeInfo.implements.length > 0) {
    declaration += ` implements ${typeInfo.implements.join(', ')}`;
  }
  
  definition += `${declaration} {\n`;
  
  // Add method signatures
  for (const method of typeInfo.methods) {
    const methodModifiers = method.modifiers.join(' ');
    const params = method.parameters.join(', ');
    definition += `    ${methodModifiers} ${method.returnType} ${method.name}(${params});\n`;
  }
  
  definition += `}\n`;
  
  return definition;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: fetch-java-definition <java.type.Name>');
    process.exit(1);
  }
  
  const javaType = args[0];
  const definition = await generateJavaDefinition(javaType);
  console.log(definition);
}

// Run if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { generateJavaDefinition };

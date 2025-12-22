#!/usr/bin/env node

import { extractJavaSignatures } from './fetch-java-api.ts';
import { typeNameToJavaUrl } from './utils.ts';
import * as cheerio from 'cheerio';

export async function generateJavaDefinitionFromHtml(javaType: string, html: string): Promise<string> {
  const $ = cheerio.load(html);
  const parts = javaType.split('.');
  const className = parts[parts.length - 1];
  
  let packageName = '';
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i][0] === parts[i][0].toUpperCase()) break;
    packageName += (packageName ? '.' : '') + parts[i];
  }
  
  const heading = $('h1').first().text();
  const kind = heading.includes('interface ') ? 'interface' : 'class';
  const modifiers = kind === 'class' ? 'public final' : 'public';
  
  const signatures = extractJavaSignatures(html);
  
  const url = typeNameToJavaUrl(javaType);
  let definition = `// Source: ${url}\n\n`;
  
  if (packageName) {
    definition += `package ${packageName};\n\n`;
  }
  
  definition += `${modifiers} ${kind} ${className} {\n`;
  
  for (const sig of signatures) {
    if (sig.hasOverride) {
      definition += '    @Override\n';
    }
    definition += `    public ${sig.signature};\n`;
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
  
  console.error('Error: Direct execution not supported. Use generate-all.ts instead.');
  process.exit(1);
}

if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { generateJavaDefinitionFromHtml as generateJavaDefinition };

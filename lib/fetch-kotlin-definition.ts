#!/usr/bin/env node

import { extractKotlinSignatures } from './fetch-kotlin-api.ts';
import { typeNameToKotlinUrl } from './utils.ts';
import * as cheerio from 'cheerio';

export async function generateKotlinDefinitionFromHtml(kotlinType: string, html: string): Promise<string> {
  const $ = cheerio.load(html);
  const parts = kotlinType.split('.');
  const className = parts[parts.length - 1];
  
  let packageName = '';
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i][0] === parts[i][0].toUpperCase()) break;
    packageName += (packageName ? '.' : '') + parts[i];
  }
  
  const heading = $('h1').first().text();
  const kind = heading.includes('interface ') ? 'interface' : 'class';
  
  const signatures = extractKotlinSignatures(html);
  
  const url = typeNameToKotlinUrl(kotlinType);
  let definition = `// Source: ${url}\n\n`;
  
  if (packageName) {
    definition += `package ${packageName}\n\n`;
  }
  
  definition += `${kind} ${className} {\n`;
  
  for (const sig of signatures) {
    definition += `    ${sig.signature}\n`;
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
  const url = typeNameToKotlinUrl(kotlinType);
  console.log(`Fetching ${kotlinType} from ${url}...`);
  process.exit(1);
}

if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { generateKotlinDefinitionFromHtml as generateKotlinDefinition };

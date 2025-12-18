#!/usr/bin/env node
/**
 * Parse type definition files and generate mapping details
 * Uses signature-based comparison as requested
 */

import * as fs from 'fs/promises';
import * as yaml from 'yaml';

interface ParsedMember {
  kind: 'property' | 'method' | 'function';
  name: string;
  signature: string;
}

interface ParsedType {
  packageName: string;
  className: string;
  kind: 'class' | 'interface';
  members: ParsedMember[];
}

/**
 * Simple parser for Java definition files
 */
function parseJavaDefinition(content: string): ParsedType {
  const members: ParsedMember[] = [];
  const lines = content.split('\n');
  
  let packageName = '';
  let className = '';
  let kind: 'class' | 'interface' = 'class';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Parse package
    if (trimmed.startsWith('package ')) {
      packageName = trimmed.match(/package\s+([\w.]+);/)?.[1] || '';
    }
    
    // Parse class/interface declaration
    if (trimmed.includes(' class ') || trimmed.includes(' interface ')) {
      const match = trimmed.match(/(?:public\s+)?(?:final\s+)?(class|interface)\s+(\w+)/);
      if (match) {
        kind = match[1] as 'class' | 'interface';
        className = match[2];
      }
    }
    
    // Parse method signatures - capture full signature
    const methodMatch = trimmed.match(/^((?:public|protected|private|static|final)\s+)+(.+?)\s+(\w+)\s*\(([^)]*)\);/);
    if (methodMatch) {
      members.push({
        kind: 'method',
        name: methodMatch[3],
        signature: trimmed.replace(/;$/, '')
      });
    }
  }
  
  return { packageName, className, kind, members };
}

/**
 * Simple parser for Kotlin definition files
 */
function parseKotlinDefinition(content: string): ParsedType {
  const members: ParsedMember[] = [];
  const lines = content.split('\n');
  
  let packageName = '';
  let className = '';
  let kind: 'class' | 'interface' = 'class';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Parse package
    if (trimmed.startsWith('package ')) {
      packageName = trimmed.replace('package ', '').trim();
    }
    
    // Parse class/interface declaration
    if (trimmed.match(/^(?:open\s+)?(class|interface)\s+/)) {
      const match = trimmed.match(/^(?:open\s+)?(class|interface)\s+(\w+)/);
      if (match) {
        kind = match[1] as 'class' | 'interface';
        className = match[2];
      }
    }
    
    // Parse property signatures
    if (trimmed.match(/^(?:override\s+)?(?:var|val)\s+/)) {
      members.push({
        kind: 'property',
        name: trimmed.match(/(?:var|val)\s+(\w+)/)?.[1] || '',
        signature: trimmed
      });
    }
    
    // Parse function signatures
    if (trimmed.match(/^(?:override\s+)?(?:operator\s+)?fun\s+/)) {
      const funcMatch = trimmed.match(/fun\s+(\w+)/);
      if (funcMatch) {
        members.push({
          kind: 'function',
          name: funcMatch[1],
          signature: trimmed
        });
      }
    }
  }
  
  return { packageName, className, kind, members };
}

/**
 * Compare Java and Kotlin types to generate signature-based mapping
 * Per user requirement: use signature matching instead of grouping by property/method
 */
function generateMapping(javaType: ParsedType, kotlinType: ParsedType) {
  const mappings: Array<{ kotlin: string; java: string }> = [];
  
  // Map each Kotlin member to corresponding Java member(s)
  for (const kotlinMember of kotlinType.members) {
    for (const javaMember of javaType.members) {
      let isMatch = false;
      
      // Direct name matching
      if (kotlinMember.name === javaMember.name) {
        isMatch = true;
      }
      // Property to getter method (e.g., Kotlin 'message' -> Java 'getMessage')
      else if (kotlinMember.kind === 'property') {
        const getterName = 'get' + kotlinMember.name.charAt(0).toUpperCase() + kotlinMember.name.slice(1);
        if (javaMember.name === getterName) {
          isMatch = true;
        }
      }
      // Special cases
      else if (kotlinMember.name === 'get' && javaMember.name === 'charAt') {
        // Kotlin String.get() maps to Java String.charAt()
        isMatch = true;
      }
      else if (kotlinMember.name === 'removeAt' && javaMember.name === 'remove') {
        // Kotlin removeAt(index) maps to Java remove(int)
        // Need to check if it's the index-based overload
        if (javaMember.signature.includes('int index') || javaMember.signature.includes('int,')) {
          isMatch = true;
        }
      }
      
      if (isMatch) {
        mappings.push({
          kotlin: kotlinMember.signature,
          java: javaMember.signature
        });
      }
    }
  }
  
  return mappings;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: generate-mapping-details <kotlin-def-file> <java-def-file> <output-file>');
    process.exit(1);
  }
  
  const kotlinFile = args[0];
  const javaFile = args[1];
  const outputFile = args[2] || 'mapping-details.yaml';
  
  const kotlinContent = await fs.readFile(kotlinFile, 'utf-8');
  const javaContent = await fs.readFile(javaFile, 'utf-8');
  
  const kotlinType = parseKotlinDefinition(kotlinContent);
  const javaType = parseJavaDefinition(javaContent);
  
  const mappings = generateMapping(javaType, kotlinType);
  
  const output = yaml.stringify(mappings);
  await fs.writeFile(outputFile, output, 'utf-8');
  
  console.log(`Generated mapping details: ${outputFile}`);
  console.log(`Found ${mappings.length} mappings`);
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { parseJavaDefinition, parseKotlinDefinition, generateMapping };

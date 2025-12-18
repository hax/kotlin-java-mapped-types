#!/usr/bin/env node
/**
 * Parse type definition files and generate mapping details
 */

import * as fs from 'fs/promises';
import * as path from 'path';
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
    if (trimmed.startsWith('public class ') || trimmed.startsWith('public interface ') || 
        trimmed.startsWith('public final class ')) {
      const match = trimmed.match(/public\s+(?:final\s+)?(class|interface)\s+(\w+)/);
      if (match) {
        kind = match[1] as 'class' | 'interface';
        className = match[2];
      }
    }
    
    // Parse method signatures
    const methodMatch = trimmed.match(/^public\s+(?:static\s+)?(\w+(?:<[^>]+>)?)\s+(\w+)\s*\(([^)]*)\);/);
    if (methodMatch) {
      const returnType = methodMatch[1];
      const methodName = methodMatch[2];
      const params = methodMatch[3];
      members.push({
        kind: 'method',
        name: methodName,
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
    if (trimmed.startsWith('class ') || trimmed.startsWith('interface ')) {
      const match = trimmed.match(/^(class|interface)\s+(\w+)/);
      if (match) {
        kind = match[1] as 'class' | 'interface';
        className = match[2];
      }
    }
    
    // Parse property signatures
    const propMatch = trimmed.match(/^val\s+(\w+):\s*(.+)/);
    if (propMatch) {
      members.push({
        kind: 'property',
        name: propMatch[1],
        signature: trimmed
      });
    }
    
    // Parse function signatures
    const funcMatch = trimmed.match(/^(?:operator\s+|override\s+)?fun\s+(\w+)\s*\(([^)]*)\)(?::\s*(.+))?/);
    if (funcMatch) {
      members.push({
        kind: 'function',
        name: funcMatch[1],
        signature: trimmed
      });
    }
  }
  
  return { packageName, className, kind, members };
}

/**
 * Compare Java and Kotlin types to generate mapping
 */
function generateMapping(javaType: ParsedType, kotlinType: ParsedType) {
  const mappings: Array<{ kotlin: string; java: string }> = [];
  
  // Map Kotlin properties and functions to Java methods
  for (const kotlinMember of kotlinType.members) {
    for (const javaMember of javaType.members) {
      // Simple name matching for now
      // In a real implementation, this would use more sophisticated matching
      if (kotlinMember.name === javaMember.name) {
        mappings.push({
          kotlin: kotlinMember.signature,
          java: javaMember.signature
        });
      } else if (kotlinMember.kind === 'property') {
        // Try to match property to getter method
        const getterName = 'get' + kotlinMember.name.charAt(0).toUpperCase() + kotlinMember.name.slice(1);
        if (javaMember.name === getterName) {
          mappings.push({
            kotlin: kotlinMember.signature,
            java: javaMember.signature
          });
        }
        // Also try direct name match for methods like size(), length()
        if (javaMember.name === kotlinMember.name) {
          mappings.push({
            kotlin: kotlinMember.signature,
            java: javaMember.signature
          });
        }
      } else if (kotlinMember.name === 'get' && javaMember.name === 'charAt') {
        // Special case: Kotlin get() maps to Java charAt()
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

if (require.main === module) {
  main().catch(console.error);
}

export { parseJavaDefinition, parseKotlinDefinition, generateMapping };

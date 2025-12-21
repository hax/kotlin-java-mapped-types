/**
 * Fetch Kotlin type signatures from official Kotlin API documentation
 * https://kotlinlang.org/api/core/kotlin-stdlib/
 */

import * as cheerio from 'cheerio';
import { fetchText } from './fetch-text.ts';

interface PropertySignature {
  modifiers: string[];
  name: string;
  type: string;
}

interface FunctionSignature {
  modifiers: string[];
  returnType: string;
  name: string;
  parameters: string[];
}

interface KotlinTypeInfo {
  kind: 'class' | 'interface';
  modifiers: string[];
  extends?: string;
  implements?: string[];
  properties: PropertySignature[];
  functions: FunctionSignature[];
}

/**
 * Convert Kotlin type name to URL format
 * Handles nested types like Map.Entry by converting all class names to kebab-case
 * e.g., kotlin.collections.Map.Entry -> kotlin.collections/-map/-entry/
 */
function typeNameToPath(typeName: string): string {
  const parts = typeName.split('.');
  
  // Find where the package ends and class names begin
  // Package names are lowercase, class names start with uppercase
  let packageEndIndex = parts.findIndex(part => /^[A-Z]/.test(part));
  if (packageEndIndex === -1) {
    packageEndIndex = parts.length;
  }
  
  const packagePath = parts.slice(0, packageEndIndex).join('.');
  const classNames = parts.slice(packageEndIndex);
  
  // Convert all class names to kebab-case with leading dash
  const kebabNames = classNames.map(name => 
    name.replace(/([A-Z])/g, '-$1').toLowerCase()
  ).join('/');
  
  return `${packagePath}/${kebabNames}/`;
}

/**
 * Parse Kotlin type from HTML content
 */
export function parseKotlinTypeFromHtml(html: string): KotlinTypeInfo | null {
  try {
    const $ = cheerio.load(html);
    
    // Parse the HTML to extract type information from Kotlin docs
    const typeInfo: KotlinTypeInfo = {
      kind: 'interface',
      modifiers: [],
      properties: [],
      functions: []
    };
    
    // Determine if it's a class or interface
    const heading = $('h1').first().text();
    if (heading.includes('class ')) {
      typeInfo.kind = 'class';
    } else if (heading.includes('interface ')) {
      typeInfo.kind = 'interface';
    }
    
    // Extract properties and functions
    // Kotlin docs structure: look for declarations in the documentation
    // Try multiple selectors as the docs structure may vary
    const declarationSelectors = [
      '.declarations .signature',  // Original selector
      '[data-kotlin-type="property"] code', // Alternative for properties
      '[data-kotlin-type="function"] code', // Alternative for functions
      '.symbol.monospace',         // Another common pattern
      'code.api-signature',        // Yet another pattern
    ];
    
    // Collect all signature texts from various selectors
    const signatures = new Set<string>();
    for (const selector of declarationSelectors) {
      $(selector).each((_, element) => {
        const signature = $(element).text().trim();
        // Normalize whitespace in signature
        const normalizedSignature = signature.replace(/\s+/g, ' ').trim();
        if (normalizedSignature) {
          signatures.add(normalizedSignature);
        }
      });
    }
    
    // Also try to extract from any code blocks that look like declarations
    $('code').each((_, element) => {
      const signature = $(element).text().trim();
      const normalizedSignature = signature.replace(/\s+/g, ' ').trim();
      // Only add if it looks like a property or function declaration
      if (normalizedSignature.match(/^\s*(val|var)\s+\w+:/)) {
        signatures.add(normalizedSignature);
      } else if (normalizedSignature.match(/^\s*(?:operator\s+|override\s+)?fun\s+\w+\s*\(/)) {
        signatures.add(normalizedSignature);
      }
    });
    
    // Parse all collected signatures
    for (const signature of signatures) {
      // Parse property signatures (val/var)
      if (signature.match(/^\s*(val|var)\s+/)) {
        const propMatch = signature.match(/^\s*(val|var)\s+(\w+):\s*(.+)/);
        if (propMatch) {
          // Check if we already have this property (avoid duplicates)
          const exists = typeInfo.properties.some(p => p.name === propMatch[2]);
          if (!exists) {
            typeInfo.properties.push({
              modifiers: [],
              name: propMatch[2],
              type: propMatch[3].trim()
            });
          }
        }
      }
      // Parse function signatures
      else if (signature.match(/^\s*fun\s+/)) {
        const funcMatch = signature.match(/^\s*(?:(operator|override)\s+)?fun\s+(\w+)\s*\(([^)]*)\)(?::\s*(.+))?/);
        if (funcMatch) {
          // Check if we already have this function (avoid duplicates)
          const exists = typeInfo.functions.some(f => f.name === funcMatch[2]);
          if (!exists) {
            const modifiers: string[] = [];
            if (funcMatch[1]) modifiers.push(funcMatch[1]);
            
            typeInfo.functions.push({
              modifiers,
              returnType: funcMatch[4] ? funcMatch[4].trim() : 'Unit',
              name: funcMatch[2],
              parameters: funcMatch[3] ? funcMatch[3].split(',').map(p => p.trim()) : []
            });
          }
        }
      }
    }
    
    return typeInfo;
  } catch (error) {
    console.error('Error parsing Kotlin type from HTML:', error);
    return null;
  }
}

/**
 * Fetch and parse Kotlin type from official documentation
 */
export async function fetchKotlinType(typeName: string): Promise<KotlinTypeInfo | null> {
  try {
    // Convert type name to URL path
    // e.g., kotlin.collections.MutableMap -> kotlin.collections/-mutable-map/
    const path = typeNameToPath(typeName);
    const url = `https://kotlinlang.org/api/core/kotlin-stdlib/${path}`;
    
    console.log(`Fetching Kotlin type from: ${url}`);

    const html = await fetchText(url);
    if (!html) {
      console.error(`Error fetching Kotlin type ${typeName}: no content returned`);
      return null;
    }

    return parseKotlinTypeFromHtml(html);
  } catch (error) {
    console.error(`Error fetching Kotlin type ${typeName}:`, error);
    return null;
  }
}

/**
 * Get Kotlin type info from official docs
 */
export async function getKotlinTypeInfo(typeName: string): Promise<KotlinTypeInfo | null> {
  return await fetchKotlinType(typeName);
}

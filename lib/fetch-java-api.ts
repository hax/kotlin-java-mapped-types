/**
 * Fetch Java type signatures from official Android documentation
 * https://developer.android.com/reference/
 */

import * as cheerio from 'cheerio';

interface MethodSignature {
  modifiers: string[];
  returnType: string;
  name: string;
  parameters: string[];
}

interface JavaTypeInfo {
  kind: 'class' | 'interface';
  modifiers: string[];
  extends?: string;
  implements?: string[];
  methods: MethodSignature[];
}

// CSS selectors for different Android documentation table structures
// Covers: table.responsive (common), table.methods (older), .devsite-table-wrapper (newer)
const METHOD_TABLE_SELECTORS = 'table.responsive tbody tr, table.methods tbody tr, .devsite-table-wrapper table tbody tr';

// Regex to extract method name and parameters from method signature
// Matches: methodName(param1, param2, ...) or methodName()
// Note: This is a simplified pattern. Complex generics with nested commas may require more robust parsing.
const METHOD_SIGNATURE_PATTERN = /(\w+)\s*\(([^)]*)\)/;

/**
 * Fetch and parse Java type from Android documentation
 */
export async function fetchJavaType(typeName: string): Promise<JavaTypeInfo | null> {
  try {
    // Convert type name to URL path
    // e.g., java.lang.String -> java/lang/String
    const path = typeName.split('.').join('/');
    const url = `https://developer.android.com/reference/${path}`;
    
    console.log(`Fetching Java type from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${typeName}: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Parse the HTML to extract type information from Android docs
    const typeInfo: JavaTypeInfo = {
      kind: 'interface',
      modifiers: ['public'],
      methods: []
    };
    
    // Determine if it's a class or interface
    const heading = $('h1').first().text();
    if (heading.includes('class ')) {
      typeInfo.kind = 'class';
    } else if (heading.includes('interface ')) {
      typeInfo.kind = 'interface';
    }
    
    // Extract method signatures
    // Android docs structure: methods are in tables with class 'responsive' or similar
    // Try multiple selectors to handle different Android documentation versions
    const methodRows = $(METHOD_TABLE_SELECTORS);
    
    methodRows.each((_, element) => {
      const $row = $(element);
      const cells = $row.find('td');
      
      if (cells.length >= 2) {
        // First cell typically contains return type
        const returnType = cells.first().text().trim();
        
        // Second cell contains method signature (name and parameters)
        const methodCell = cells.eq(1);
        const codeText = methodCell.find('code').first().text().trim();
        
        if (codeText) {
          // Parse method name and parameters from code text
          // Format: methodName(params) or <a>methodName</a>(params)
          const methodMatch = codeText.match(METHOD_SIGNATURE_PATTERN);
          if (methodMatch) {
            const name = methodMatch[1];
            // Note: Simple comma split - doesn't handle complex generics like Map<K,V>
            // For basic types and most common cases, this is sufficient
            const params = methodMatch[2] 
              ? methodMatch[2].split(',').map(p => p.trim()).filter(p => p.length > 0)
              : [];
            
            typeInfo.methods.push({
              modifiers: ['public'],
              returnType,
              name,
              parameters: params
            });
          }
        }
      }
    });
    
    return typeInfo;
  } catch (error) {
    console.error(`Error fetching Java type ${typeName}:`, error);
    return null;
  }
}

/**
 * Get Java type info from official docs
 */
export async function getJavaTypeInfo(typeName: string): Promise<JavaTypeInfo | null> {
  return await fetchJavaType(typeName);
}

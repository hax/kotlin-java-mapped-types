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
    // Android docs structure: look for method details in the documentation
    $('.api-item').each((_, element) => {
      const $elem = $(element);
      const signature = $elem.find('.api-signature').text().trim();
      
      if (signature) {
        // Parse signature to extract method info
        // This is a simplified parsing - real implementation would be more robust
        const methodMatch = signature.match(/(\w+)\s+(\w+)\s*\(([^)]*)\)/);
        if (methodMatch) {
          const returnType = methodMatch[1];
          const name = methodMatch[2];
          const params = methodMatch[3] ? methodMatch[3].split(',').map(p => p.trim()) : [];
          
          typeInfo.methods.push({
            modifiers: ['public'],
            returnType,
            name,
            parameters: params
          });
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

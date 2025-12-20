/**
 * Extract Kotlin-Java mapped types from Kotlin documentation
 */

import * as cheerio from 'cheerio';

export interface TypeMapping {
  kotlin: string;
  java: string;
}

/**
 * Fetch and extract mapped types from Kotlin documentation
 * https://kotlinlang.org/docs/java-interop.html#mapped-types
 * 
 * Note: This function throws errors instead of falling back to hardcoded mappings.
 * This ensures we catch documentation structure changes early rather than using stale data.
 */
export async function extractMappedTypesFromDocs(): Promise<TypeMapping[]> {
  try {
    const url = 'https://kotlinlang.org/docs/java-interop.html';
    console.log(`Fetching mapped types from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch documentation: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const mappings: TypeMapping[] = [];
    
    // Find the mapped types section by its specific id
    // The official Kotlin documentation has a single section with id="mapped-types"
    let foundMappings = false;
    
    $('h2, h3').each((_, elem) => {
      const $elem = $(elem);
      const id = $elem.attr('id');
      const text = $elem.text();
      
      // Match the specific "mapped-types" section by id
      // Fall back to text matching only if id is not available
      if (id === 'mapped-types' || (text.toLowerCase() === 'mapped types')) {
        console.log(`Found section: ${text}`);
        
        // Look for tables within the parent section (tables are wrapped in divs)
        const parentSection = $elem.parent();
        const tables = parentSection.find('table');
        
        if (tables.length > 0) {
          console.log(`Parsing ${tables.length} tables...`);
          
          tables.each((tableIdx, table) => {
            const $table = $(table);
            
            $table.find('tr').each((i, row) => {
              const cells = $(row).find('td');
              
              // Skip header rows (no td cells)
              if (cells.length < 2) {
                return;
              }
              
              // Get Java and Kotlin types (Java is in column 0, Kotlin in column 1)
              const javaTypeRaw = $(cells[0]).text().trim();
              const kotlinTypeRaw = $(cells[1]).text().trim();
              
              // For collection tables, there's also a mutable type in column 2
              const mutableKotlinTypeRaw = cells.length >= 3 ? $(cells[2]).text().trim() : null;
              
              // Clean up types by removing platform type markers (!, ?) and whitespace
              const cleanType = (type: string) => type.replace(/[!?]/g, '').replace(/\s+/g, '');
              
              const javaType = cleanType(javaTypeRaw);
              const kotlinType = cleanType(kotlinTypeRaw);
              const mutableKotlinType = mutableKotlinTypeRaw ? cleanType(mutableKotlinTypeRaw) : null;
              
              // Add full package names for simple type names
              const qualifyJavaType = (type: string) => {
                // Handle generics
                const baseType = type.split('<')[0];
                const generics = type.includes('<') ? type.substring(type.indexOf('<')) : '';
                
                // Already qualified (starts with package name)
                if (baseType.startsWith('java.')) return type;
                
                // Map.Entry (nested type)
                if (baseType === 'Map.Entry') {
                  return `java.util.Map.Entry${generics}`;
                }
                
                // Collection types
                if (['Iterator', 'Iterable', 'Collection', 'Set', 'List', 'ListIterator', 'Map'].includes(baseType)) {
                  return `java.util.${baseType}${generics}`;
                }
                
                return type;
              };
              
              const qualifyKotlinType = (type: string) => {
                // Already qualified
                if (type.startsWith('kotlin.')) return type;
                
                // Handle generics
                const baseType = type.split('<')[0];
                const generics = type.includes('<') ? type.substring(type.indexOf('<')) : '';
                
                // Collection types
                if (['Iterator', 'Iterable', 'Collection', 'Set', 'List', 'ListIterator', 'Map',
                     'MutableIterator', 'MutableIterable', 'MutableCollection', 'MutableSet', 
                     'MutableList', 'MutableListIterator', 'MutableMap'].includes(baseType)) {
                  return `kotlin.collections.${baseType}${generics}`;
                }
                // Map.Entry and MutableMap.MutableEntry
                if (baseType === 'Map.Entry') {
                  return `kotlin.collections.Map.Entry${generics}`;
                }
                if (baseType === 'MutableMap.MutableEntry') {
                  return `kotlin.collections.MutableMap.MutableEntry${generics}`;
                }
                // Base types
                return `kotlin.${baseType}${generics}`;
              };
              
              const qualifiedJava = qualifyJavaType(javaType);
              const qualifiedKotlin = qualifyKotlinType(kotlinType);
              
              // Add the mapping if both types are qualified
              if (qualifiedJava.startsWith('java.') && qualifiedKotlin.startsWith('kotlin.')) {
                // Remove generics for the mapping (we want base types only)
                const javaBase = qualifiedJava.split('<')[0];
                const kotlinBase = qualifiedKotlin.split('<')[0];
                mappings.push({ kotlin: kotlinBase, java: javaBase });
              }
              
              // For collection tables, also add the mutable mapping
              if (mutableKotlinType) {
                const qualifiedMutableKotlin = qualifyKotlinType(mutableKotlinType);
                if (qualifiedJava.startsWith('java.') && qualifiedMutableKotlin.startsWith('kotlin.')) {
                  const javaBase = qualifiedJava.split('<')[0];
                  const mutableKotlinBase = qualifiedMutableKotlin.split('<')[0];
                  mappings.push({ kotlin: mutableKotlinBase, java: javaBase });
                }
              }
            });
          });
          
          // Mark as found if we got any mappings
          if (mappings.length > 0) {
            foundMappings = true;
            return false; // Break out of the .each() loop
          }
        }
      }
    });
    
    if (!foundMappings) {
      throw new Error('Could not find mapped-types section in documentation');
    }
    
    if (mappings.length === 0) {
      throw new Error('No mappings extracted from documentation');
    }
    
    console.log(`Extracted ${mappings.length} type mappings from documentation`);
    return mappings;
    
  } catch (error) {
    console.error('Error extracting mapped types from documentation:', error);
    throw error;
  }
}

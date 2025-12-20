/**
 * Extract Kotlin-Java mapped types from Kotlin documentation
 */

import * as cheerio from 'cheerio';
import { cachedFetchText } from './http-cache.ts';

export interface TypeMapping {
  kotlin: string;
  java: string;
}

/**
 * Fetch and extract mapped types from Kotlin documentation
 * https://kotlinlang.org/docs/java-interop.html#mapped-types
 */
export async function extractMappedTypesFromDocs(): Promise<TypeMapping[]> {
  try {
    const url = 'https://kotlinlang.org/docs/java-interop.html';
    console.log(`Fetching mapped types from: ${url}`);
    
    // Use cached fetch with HTTP caching support (If-Modified-Since, ETag)
    const html = await cachedFetchText(url);
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
        
        // Look for table after this heading
        const nextTable = $elem.nextAll('table').first();
        if (nextTable.length > 0) {
          console.log('Parsing mapped types table...');
          
          nextTable.find('tr').each((i, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 2) {
              const kotlinType = $(cells[0]).text().trim();
              const javaType = $(cells[1]).text().trim();
              
              // Skip empty rows and header rows
              // Validate that types start with proper package names
              if (kotlinType && javaType && 
                  /^kotlin\./.test(kotlinType) && /^java\./.test(javaType)) {
                mappings.push({ kotlin: kotlinType, java: javaType });
              }
            }
          });
          
          // Stop after processing the matched section to avoid duplicates
          // The official docs should have only one "mapped-types" section
          if (mappings.length > 0) {
            foundMappings = true;
            return false; // Break out of the .each() loop
          }
        }
      }
    });
    
    if (!foundMappings) {
      console.warn('Warning: Could not extract mappings from documentation');
    }
    
    if (mappings.length === 0) {
      console.warn('Warning: No mappings extracted from documentation, using fallback');
      // Fallback to known mappings if extraction fails
      return getFallbackMappings();
    }
    
    console.log(`Extracted ${mappings.length} type mappings from documentation`);
    return mappings;
    
  } catch (error) {
    console.error('Error extracting mapped types from documentation:', error);
    console.log('Using fallback mappings...');
    return getFallbackMappings();
  }
}

/**
 * Fallback mapped types in case documentation extraction fails
 * Based on official Kotlin documentation
 * https://kotlinlang.org/docs/java-interop.html#mapped-types
 */
function getFallbackMappings(): TypeMapping[] {
  return [
    { kotlin: 'kotlin.Any', java: 'java.lang.Object' },
    { kotlin: 'kotlin.Byte', java: 'java.lang.Byte' },
    { kotlin: 'kotlin.Short', java: 'java.lang.Short' },
    { kotlin: 'kotlin.Int', java: 'java.lang.Integer' },
    { kotlin: 'kotlin.Long', java: 'java.lang.Long' },
    { kotlin: 'kotlin.Char', java: 'java.lang.Character' },
    { kotlin: 'kotlin.Float', java: 'java.lang.Float' },
    { kotlin: 'kotlin.Double', java: 'java.lang.Double' },
    { kotlin: 'kotlin.Boolean', java: 'java.lang.Boolean' },
    { kotlin: 'kotlin.String', java: 'java.lang.String' },
    { kotlin: 'kotlin.CharSequence', java: 'java.lang.CharSequence' },
    { kotlin: 'kotlin.Throwable', java: 'java.lang.Throwable' },
    { kotlin: 'kotlin.Cloneable', java: 'java.lang.Cloneable' },
    { kotlin: 'kotlin.Comparable', java: 'java.lang.Comparable' },
    { kotlin: 'kotlin.Enum', java: 'java.lang.Enum' },
    { kotlin: 'kotlin.Annotation', java: 'java.lang.annotation.Annotation' },
    { kotlin: 'kotlin.collections.Iterator', java: 'java.util.Iterator' },
    { kotlin: 'kotlin.collections.Iterable', java: 'java.lang.Iterable' },
    { kotlin: 'kotlin.collections.Collection', java: 'java.util.Collection' },
    { kotlin: 'kotlin.collections.Set', java: 'java.util.Set' },
    { kotlin: 'kotlin.collections.List', java: 'java.util.List' },
    { kotlin: 'kotlin.collections.ListIterator', java: 'java.util.ListIterator' },
    { kotlin: 'kotlin.collections.Map', java: 'java.util.Map' },
    { kotlin: 'kotlin.collections.Map.Entry', java: 'java.util.Map.Entry' },
    { kotlin: 'kotlin.collections.MutableIterator', java: 'java.util.Iterator' },
    { kotlin: 'kotlin.collections.MutableIterable', java: 'java.lang.Iterable' },
    { kotlin: 'kotlin.collections.MutableCollection', java: 'java.util.Collection' },
    { kotlin: 'kotlin.collections.MutableSet', java: 'java.util.Set' },
    { kotlin: 'kotlin.collections.MutableList', java: 'java.util.List' },
    { kotlin: 'kotlin.collections.MutableListIterator', java: 'java.util.ListIterator' },
    { kotlin: 'kotlin.collections.MutableMap', java: 'java.util.Map' },
    { kotlin: 'kotlin.collections.MutableMap.MutableEntry', java: 'java.util.Map.Entry' },
  ];
}

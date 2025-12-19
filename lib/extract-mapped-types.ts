#!/usr/bin/env node
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
 */
export async function extractMappedTypesFromDocs(): Promise<TypeMapping[]> {
  try {
    const url = 'https://kotlinlang.org/docs/java-interop.html';
    console.log(`Fetching mapped types from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch documentation: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const mappings: TypeMapping[] = [];
    
    // Find the mapped types section
    // Look for the section with id "mapped-types" or heading containing "Mapped types"
    let foundSection = false;
    
    $('h2, h3').each((_, elem) => {
      const $elem = $(elem);
      const id = $elem.attr('id');
      const text = $elem.text();
      
      // Check if this is the mapped types section
      if (id === 'mapped-types' || text.toLowerCase().includes('mapped types')) {
        foundSection = true;
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
              if (kotlinType && javaType && 
                  kotlinType.includes('kotlin') && javaType.includes('java')) {
                mappings.push({ kotlin: kotlinType, java: javaType });
              }
            }
          });
        }
      }
    });
    
    if (!foundSection) {
      console.warn('Warning: Could not find mapped types section in documentation');
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

async function main() {
  console.log('Extracting Kotlin-Java mapped types from documentation...\n');
  
  const mappings = await extractMappedTypesFromDocs();
  
  console.log(`\nFound ${mappings.length} type mappings:`);
  for (const mapping of mappings) {
    console.log(`  ${mapping.kotlin} <-> ${mapping.java}`);
  }
}

// Run if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

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

import * as cheerio from 'cheerio';
import { fetchText } from './fetch-text.ts';

export interface TypeMapping {
  kotlin: string;
  java: string;
}

export async function extractMappedTypesFromDocs(): Promise<TypeMapping[]> {
  try {
    const url = 'https://kotlinlang.org/docs/java-interop.html';
    console.log(`Fetching mapped types from: ${url}`);

    const html = await fetchText(url);
    if (!html) {
      throw new Error('Failed to fetch mapped types page');
    }
    const $ = cheerio.load(html);
    
    const mappings: TypeMapping[] = [];
    let foundMappings = false;
    
    $('h2, h3').each((_, elem) => {
      const $elem = $(elem);
      const id = $elem.attr('id');
      const text = $elem.text();
      
      if (id === 'mapped-types' || (text.toLowerCase() === 'mapped types')) {
        console.log(`Found section: ${text}`);
        
        const parentSection = $elem.parent();
        const tables = parentSection.find('table');
        
        if (tables.length > 0) {
          console.log(`Parsing ${tables.length} tables...`);
          
          tables.each((tableIdx, table) => {
            const $table = $(table);
            
            $table.find('tr').each((i, row) => {
              const cells = $(row).find('td');
              
              if (cells.length < 2) {
                return;
              }
              
              const javaTypeRaw = $(cells[0]).text().trim();
              const kotlinTypeRaw = $(cells[1]).text().trim();
              const mutableKotlinTypeRaw = cells.length >= 3 ? $(cells[2]).text().trim() : null;
              
              const cleanType = (type: string) => type.replace(/[!?]/g, '').replace(/\s+/g, '');
              
              const javaType = cleanType(javaTypeRaw);
              const kotlinType = cleanType(kotlinTypeRaw);
              const mutableKotlinType = mutableKotlinTypeRaw ? cleanType(mutableKotlinTypeRaw) : null;
              
              const qualifyJavaType = (type: string) => {
                const baseType = type.split('<')[0];
                const generics = type.includes('<') ? type.substring(type.indexOf('<')) : '';
                
                if (baseType.startsWith('java.')) return type;
                
                if (baseType === 'Map.Entry') {
                  return `java.util.Map.Entry${generics}`;
                }

                if (baseType === 'Iterable') {
                  return `java.lang.Iterable${generics}`;
                }

                if (['Iterator', 'Collection', 'Set', 'List', 'ListIterator', 'Map'].includes(baseType)) {
                  return `java.util.${baseType}${generics}`;
                }
                
                return type;
              };
              
              const qualifyKotlinType = (type: string) => {
                if (type.startsWith('kotlin.')) return type;
                
                const baseType = type.split('<')[0];
                const generics = type.includes('<') ? type.substring(type.indexOf('<')) : '';
                
                if (['Iterator', 'Iterable', 'Collection', 'Set', 'List', 'ListIterator', 'Map',
                     'MutableIterator', 'MutableIterable', 'MutableCollection', 'MutableSet', 
                     'MutableList', 'MutableListIterator', 'MutableMap'].includes(baseType)) {
                  return `kotlin.collections.${baseType}${generics}`;
                }
                if (baseType === 'Map.Entry') {
                  return `kotlin.collections.Map.Entry${generics}`;
                }
                if (baseType === 'MutableMap.MutableEntry') {
                  return `kotlin.collections.MutableMap.MutableEntry${generics}`;
                }
                return `kotlin.${baseType}${generics}`;
              };
              
              const qualifiedJava = qualifyJavaType(javaType);
              const qualifiedKotlin = qualifyKotlinType(kotlinType);
              
              if (qualifiedJava.startsWith('java.') && qualifiedKotlin.startsWith('kotlin.')) {
                const javaBase = qualifiedJava.split('<')[0];
                const kotlinBase = qualifiedKotlin.split('<')[0];
                mappings.push({ kotlin: kotlinBase, java: javaBase });
              }
              
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
          
          if (mappings.length > 0) {
            foundMappings = true;
            return false;
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

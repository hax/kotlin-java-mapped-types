import { load } from 'cheerio';
import { fetchText } from './fetch-text.ts';
import { qualifyJavaType, qualifyKotlinType } from './utils.ts';

export type MappedType = [java: string, kotlin: string]

export async function getMappedTypes(): Promise<MappedType[]> {
  const url = 'https://kotlinlang.org/docs/java-interop.html';
  console.log(`Fetching mapped types`);

  const html = await fetchText(url);
  if (!html) {
    throw new Error('Failed to fetch mapped types page');
  }
  const $ = load(html);
  const tables = $("section.chapter:has(#mapped-types) table")
  if (tables.length === 0) {
    throw new Error('Could not find mapped-types table in documentation');
  }
  console.log(`Parsing ${tables.length} tables...`);
  
  const mappings: MappedType[] = [];

  for (const table of tables) {
    $(table).find('tr').each((i, row) => {
      const cells = $(row).find('td code');
      if (cells.length < 2) {
        return;
      }
      
      const java = qualifyJavaType($(cells[0]).text().trim());
      const kotlin = qualifyKotlinType($(cells[1]).text().trim());
      mappings.push([java, kotlin]);

      if (cells.length >= 3) {
        const kotlin = qualifyKotlinType($(cells[2]).text().trim());
        mappings.push([java, kotlin]);
      }
    });
  }
  if (mappings.length === 0) {
    throw new Error('No mappings extracted from documentation');
  }
  
  console.log(`Extracted ${mappings.length} type mappings from documentation`);
  
  // Add additional mapped types that are not in the official Kotlin docs
  // but are documented in Android documentation
  // See: https://developer.android.com/reference/kotlin/java/util/SortedMap
  // See: https://developer.android.com/reference/kotlin/java/util/SortedSet
  mappings.push(['java.util.SortedMap<K, V>', 'kotlin.collections.MutableMap<K, V>']);
  mappings.push(['java.util.SortedSet<E>', 'kotlin.collections.MutableSet<E>']);
  
  console.log(`Added ${2} additional mapped types from Android documentation`);
  console.log(`Total: ${mappings.length} type mappings`);
  
  return mappings;
}

#!/usr/bin/env node

/**
 * Demo script showing the Java to Kotlin converter in action.
 * 
 * This script demonstrates converting several Java types to Kotlin,
 * showing different aspects of the conversion:
 * 1. Interface conversion with inheritance
 * 2. Member mapping (methods to properties)
 * 3. Generic type conversion
 */

import { convertJavaToKotlin } from '../convert-java-to-kotlin.ts';
import { getJavaDef } from '../get-java-def.ts';

const examples = [
  {
    name: 'SortedMap',
    type: 'java.util.SortedMap',
    description: 'Interface with generic types and inheritance'
  },
  {
    name: 'Map',
    type: 'java.util.Map',
    description: 'Interface with member mappings (keySet → keys, etc.)'
  },
  {
    name: 'String',
    type: 'java.lang.String',
    description: 'Class with property conversions (length() → length, charAt → get)'
  }
];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║     Java to Kotlin Type Converter - Demo Examples          ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

for (const example of examples) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Example: ${example.name}`);
  console.log(`Type: ${example.type}`);
  console.log(`Description: ${example.description}`);
  console.log('='.repeat(70));
  
  try {
    // Fetch Java definition
    const javaDefContent = await getJavaDef(example.type);
    
    // Convert to Kotlin
    const result = await convertJavaToKotlin(javaDefContent);
    
    // Show first 15 lines of the conversion
    const lines = result.kotlinDef.split('\n');
    const preview = lines.slice(0, 15).join('\n');
    console.log(preview);
    
    if (lines.length > 15) {
      console.log(`\n... (${lines.length - 15} more lines)`);
    }
    
    // Report unmapped items
    if (result.unmappedTypes.length > 0) {
      console.log(`\n⚠️  Unmapped types: ${result.unmappedTypes.join(', ')}`);
    }
    
    if (result.unmappedMembers.length > 0) {
      console.log(`\n⚠️  ${result.unmappedMembers.length} members could not be mapped`);
    }
    
    console.log('\n✅ Conversion successful!');
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

console.log('\n\n' + '='.repeat(70));
console.log('Demo completed! Try converting your own types:');
console.log('  npm run convert <java-type-name>');
console.log('');
console.log('Example:');
console.log('  npm run convert java.util.ArrayList');
console.log('='.repeat(70));

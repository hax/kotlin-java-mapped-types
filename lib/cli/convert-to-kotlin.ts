#!/usr/bin/env node

/**
 * CLI tool to convert Java definitions to Kotlin definitions.
 * 
 * Usage: convert-to-kotlin <java-type-name>
 * 
 * Example: convert-to-kotlin java.util.SortedMap
 */

import { getJavaDef } from '../get-java-def.ts';
import { convertJavaToKotlin } from '../convert-java-to-kotlin.ts';

const USAGE = 'Usage: convert-to-kotlin <java-type-name>';

if (process.argv.length < 3) {
    console.error(USAGE);
    console.error('\nExample: convert-to-kotlin java.util.SortedMap');
    process.exit(1);
}

const javaTypeName = process.argv[2];

console.log(`Converting ${javaTypeName} to Kotlin...\n`);

// Fetch the Java definition
const javaDefContent = await getJavaDef(javaTypeName);

// Convert to Kotlin
const result = await convertJavaToKotlin(javaDefContent);

console.log('=== Kotlin Definition ===');
console.log(result.kotlinDef);

if (result.unmappedTypes.length > 0) {
    console.log('\n=== Unmapped Types ===');
    console.log('The following types could not be mapped:');
    for (const type of result.unmappedTypes) {
        console.log(`  - ${type}`);
    }
}

if (result.unmappedMembers.length > 0) {
    console.log('\n=== Unmapped Members ===');
    console.log('The following members could not be converted:');
    for (const member of result.unmappedMembers) {
        console.log(`  - ${member.kind} ${member.name}: ${member.type}`);
    }
}

console.log('\n✓ Conversion completed');

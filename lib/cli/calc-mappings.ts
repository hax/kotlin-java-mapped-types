#!/usr/bin/env node

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

import { DEFS_DIR } from '../config.ts';
import { calcMapping, parseJavaDef, parseKotlinDef, toDTS } from '../mappings.ts';

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Usage: mapping <qualified-java-type>');
    process.exit(1);
}

const dirname = join(DEFS_DIR, args[0])

const files = await readdir(dirname);

const javaFile = join(dirname, files.find(file => file.endsWith('.java'))!);
const kotlinName = files.find(file => file.endsWith('.kt'))!
const kotlinFile = join(dirname, kotlinName);

const javaContent = await readFile(javaFile, 'utf-8');
const kotlinContent = await readFile(kotlinFile, 'utf-8');

const javaType = parseJavaDef(javaContent);
const kotlinType = parseKotlinDef(kotlinContent);
console.log(javaType)
console.log(kotlinType)
const mappings = calcMapping(javaType, kotlinType);

console.log(`Mappings for ${javaType.package}.${javaType.name} <-> ${kotlinType.package}.${kotlinType.name}:`);
for (const [java, kotlin] of mappings) {
  console.log(`  ${toDTS(java)}  <->  ${toDTS(kotlin)}`);
}
#!/usr/bin/env node

import { getJavaDef } from '../get-java-def.ts';
import { getKotlinDef } from '../get-kotlin-def.ts';

import './offline.ts'

const USAGE = 'Usage: get-def-cli <full-qualified-name> [--offline]';

if (process.argv.length < 3) {
    console.error(USAGE);
    process.exit(1);
}

const typeName = process.argv[2];
const definition = typeName.startsWith('kotlin') ? await getKotlinDef(typeName) : await getJavaDef(typeName);
console.log(definition);

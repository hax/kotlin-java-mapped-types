/**
 * Tests for AST transformation logic
 * Testing type mapping: Java types → Kotlin types in d.ts format
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { transformTypesInAST, type TypeMapping } from '../lib/ast-transform.ts';
import * as ts from 'typescript';

describe('transformTypesInAST - primitive types', () => {
  test('should replace String with kotlin.String', () => {
    const dtsInput = `interface Test {
  getValue(): String;
}`;
    
    const typeMap = new Map<string, TypeMapping>([
      ['String', { kotlinType: 'kotlin.String', nullable: '' }]
    ]);
    
    const sourceFile = ts.createSourceFile('test.d.ts', dtsInput, ts.ScriptTarget.Latest, true);
    const result = transformTypesInAST(sourceFile, typeMap);
    
    const printer = ts.createPrinter();
    const output = printer.printFile(result.transformed);
    
    assert.ok(output.includes('kotlin.String'), 'Should contain kotlin.String');
    assert.strictEqual(result.appliedMappings.length, 1);
    assert.strictEqual(result.appliedMappings[0].from, 'String');
    assert.strictEqual(result.appliedMappings[0].to, 'kotlin.String');
  });

  test('should replace boolean with kotlin.Boolean', () => {
    const dtsInput = `interface Test {
  isValid(): boolean;
}`;
    
    const typeMap = new Map<string, TypeMapping>([
      ['boolean', { kotlinType: 'kotlin.Boolean', nullable: '' }]
    ]);
    
    const sourceFile = ts.createSourceFile('test.d.ts', dtsInput, ts.ScriptTarget.Latest, true);
    const result = transformTypesInAST(sourceFile, typeMap);
    
    const printer = ts.createPrinter();
    const output = printer.printFile(result.transformed);
    
    assert.ok(output.includes('kotlin.Boolean'), 'Should contain kotlin.Boolean');
    assert.strictEqual(result.appliedMappings.length, 1);
    assert.strictEqual(result.appliedMappings[0].from, 'boolean');
    assert.strictEqual(result.appliedMappings[0].to, 'kotlin.Boolean');
  });

  test('should replace int with kotlin.Int', () => {
    const dtsInput = `interface Test {
  getCount(): int;
}`;
    
    const typeMap = new Map<string, TypeMapping>([
      ['int', { kotlinType: 'kotlin.Int', nullable: '' }]
    ]);
    
    const sourceFile = ts.createSourceFile('test.d.ts', dtsInput, ts.ScriptTarget.Latest, true);
    const result = transformTypesInAST(sourceFile, typeMap);
    
    const printer = ts.createPrinter();
    const output = printer.printFile(result.transformed);
    
    assert.ok(output.includes('kotlin.Int'), 'Should contain kotlin.Int');
    assert.strictEqual(result.appliedMappings.length, 1);
  });

  test('should replace multiple primitive types', () => {
    const dtsInput = `interface Test {
  getValue(): String;
  isValid(): boolean;
  getCount(): int;
}`;
    
    const typeMap = new Map<string, TypeMapping>([
      ['String', { kotlinType: 'kotlin.String', nullable: '' }],
      ['boolean', { kotlinType: 'kotlin.Boolean', nullable: '' }],
      ['int', { kotlinType: 'kotlin.Int', nullable: '' }]
    ]);
    
    const sourceFile = ts.createSourceFile('test.d.ts', dtsInput, ts.ScriptTarget.Latest, true);
    const result = transformTypesInAST(sourceFile, typeMap);
    
    const printer = ts.createPrinter();
    const output = printer.printFile(result.transformed);
    
    assert.ok(output.includes('kotlin.String'), 'Should contain kotlin.String');
    assert.ok(output.includes('kotlin.Boolean'), 'Should contain kotlin.Boolean');
    assert.ok(output.includes('kotlin.Int'), 'Should contain kotlin.Int');
    assert.strictEqual(result.appliedMappings.length, 3);
  });

  test('should track unmapped types', () => {
    const dtsInput = `interface Test {
  getValue(): String;
  getCustom(): CustomType;
}`;
    
    const typeMap = new Map<string, TypeMapping>([
      ['String', { kotlinType: 'kotlin.String', nullable: '' }]
    ]);
    
    const sourceFile = ts.createSourceFile('test.d.ts', dtsInput, ts.ScriptTarget.Latest, true);
    const result = transformTypesInAST(sourceFile, typeMap);
    
    assert.strictEqual(result.appliedMappings.length, 1);
    assert.strictEqual(result.unmappedTypes.length, 1);
    assert.strictEqual(result.unmappedTypes[0], 'CustomType');
  });

  test('should not duplicate unmapped types', () => {
    const dtsInput = `interface Test {
  getFirst(): CustomType;
  getSecond(): CustomType;
}`;
    
    const typeMap = new Map<string, TypeMapping>([]);
    
    const sourceFile = ts.createSourceFile('test.d.ts', dtsInput, ts.ScriptTarget.Latest, true);
    const result = transformTypesInAST(sourceFile, typeMap);
    
    assert.strictEqual(result.unmappedTypes.length, 1);
    assert.strictEqual(result.unmappedTypes[0], 'CustomType');
  });
});

describe('transformTypesInAST - complex types', () => {
  test('should replace Map with kotlin.collections.MutableMap', () => {
    const dtsInput = `interface Test {
  getMap(): Map<String, Integer>;
}`;
    
    const typeMap = new Map<string, TypeMapping>([
      ['Map', { kotlinType: 'kotlin.collections.MutableMap', nullable: '' }],
      ['String', { kotlinType: 'kotlin.String', nullable: '' }],
      ['Integer', { kotlinType: 'kotlin.Int', nullable: '' }]
    ]);
    
    const sourceFile = ts.createSourceFile('test.d.ts', dtsInput, ts.ScriptTarget.Latest, true);
    const result = transformTypesInAST(sourceFile, typeMap);
    
    const printer = ts.createPrinter();
    const output = printer.printFile(result.transformed);
    
    assert.ok(output.includes('kotlin.collections.MutableMap'), 'Should contain kotlin.collections.MutableMap');
    assert.ok(output.includes('kotlin.String'), 'Should contain kotlin.String in generic');
    assert.ok(output.includes('kotlin.Int'), 'Should contain kotlin.Int in generic');
  });

  test('should handle interface with extends', () => {
    const dtsInput = `interface TestInterface extends BaseInterface {
  getValue(): String;
}`;
    
    const typeMap = new Map<string, TypeMapping>([
      ['String', { kotlinType: 'kotlin.String', nullable: '' }]
    ]);
    
    const sourceFile = ts.createSourceFile('test.d.ts', dtsInput, ts.ScriptTarget.Latest, true);
    const result = transformTypesInAST(sourceFile, typeMap);
    
    const printer = ts.createPrinter();
    const output = printer.printFile(result.transformed);
    
    assert.ok(output.includes('kotlin.String'), 'Should contain kotlin.String');
    assert.ok(output.includes('extends BaseInterface'), 'Should preserve extends clause');
  });
});

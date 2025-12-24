/**
 * Tests for AST transformation logic
 * Testing type mapping: Java types → Kotlin types in d.ts format
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { transformTypesInAST, type TypeMapping } from './apply-type-mappings.ts';
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
    
    // Verify the entire output string
    const expectedOutput = `interface Test {
    getValue(): kotlin.String;
}
`;
    assert.strictEqual(output, expectedOutput);
    assert.strictEqual(result.appliedMappings.length, 1);
    assert.strictEqual(result.appliedMappings[0].from, 'String');
    assert.strictEqual(result.appliedMappings[0].to, 'kotlin.String');
    assert.strictEqual(result.appliedMappings[0].path, 'ReturnType<Test["getValue"]>');
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
    
    // Verify the entire output string
    const expectedOutput = `interface Test {
    isValid(): kotlin.Boolean;
}
`;
    assert.strictEqual(output, expectedOutput);
    assert.strictEqual(result.appliedMappings.length, 1);
    assert.strictEqual(result.appliedMappings[0].from, 'boolean');
    assert.strictEqual(result.appliedMappings[0].to, 'kotlin.Boolean');
    assert.strictEqual(result.appliedMappings[0].path, 'ReturnType<Test["isValid"]>');
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
    
    // Verify the entire output string
    const expectedOutput = `interface Test {
    getCount(): kotlin.Int;
}
`;
    assert.strictEqual(output, expectedOutput);
    assert.strictEqual(result.appliedMappings.length, 1);
    assert.strictEqual(result.appliedMappings[0].path, 'ReturnType<Test["getCount"]>');
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
    
    // Verify the entire output string
    const expectedOutput = `interface Test {
    getValue(): kotlin.String;
    isValid(): kotlin.Boolean;
    getCount(): kotlin.Int;
}
`;
    assert.strictEqual(output, expectedOutput);
    assert.strictEqual(result.appliedMappings.length, 3);
  });

  test('should handle types without mappings unchanged', () => {
    const dtsInput = `interface Test {
  getValue(): String;
  getCustom(): CustomType;
}`;
    
    const typeMap = new Map<string, TypeMapping>([
      ['String', { kotlinType: 'kotlin.String', nullable: '' }]
    ]);
    
    const sourceFile = ts.createSourceFile('test.d.ts', dtsInput, ts.ScriptTarget.Latest, true);
    const result = transformTypesInAST(sourceFile, typeMap);
    
    const printer = ts.createPrinter();
    const output = printer.printFile(result.transformed);
    
    // Verify the entire output string - CustomType should remain unchanged
    const expectedOutput = `interface Test {
    getValue(): kotlin.String;
    getCustom(): CustomType;
}
`;
    assert.strictEqual(output, expectedOutput);
    assert.strictEqual(result.appliedMappings.length, 1);
  });

  test('should handle duplicate type references', () => {
    const dtsInput = `interface Test {
  getFirst(): CustomType;
  getSecond(): CustomType;
}`;
    
    const typeMap = new Map<string, TypeMapping>([]);
    
    const sourceFile = ts.createSourceFile('test.d.ts', dtsInput, ts.ScriptTarget.Latest, true);
    const result = transformTypesInAST(sourceFile, typeMap);
    
    const printer = ts.createPrinter();
    const output = printer.printFile(result.transformed);
    
    // Verify the entire output string - should remain unchanged
    const expectedOutput = `interface Test {
    getFirst(): CustomType;
    getSecond(): CustomType;
}
`;
    assert.strictEqual(output, expectedOutput);
    assert.strictEqual(result.appliedMappings.length, 0);
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
    
    // Verify the entire output string
    const expectedOutput = `interface Test {
    getMap(): kotlin.collections.MutableMap<kotlin.String, kotlin.Int>;
}
`;
    assert.strictEqual(output, expectedOutput);
    assert.strictEqual(result.appliedMappings.length, 3);
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
    
    // Verify the entire output string
    const expectedOutput = `interface TestInterface extends BaseInterface {
    getValue(): kotlin.String;
}
`;
    assert.strictEqual(output, expectedOutput);
    assert.ok(result.appliedMappings.some(m => m.from === 'String' && m.to === 'kotlin.String'));
  });
});

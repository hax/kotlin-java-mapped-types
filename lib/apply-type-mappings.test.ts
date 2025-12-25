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

  test('should apply mappings to mapped types while leaving unmapped types unchanged', () => {
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

describe('transformTypesInAST - parameter and property mappings', () => {
  test('should track path for method parameter types', () => {
    const dtsInput = `interface Test {
  setName(name: String): void;
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
    setName(name: kotlin.String): void;
}
`;
    assert.strictEqual(output, expectedOutput);
    assert.strictEqual(result.appliedMappings.length, 1);
    assert.strictEqual(result.appliedMappings[0].from, 'String');
    assert.strictEqual(result.appliedMappings[0].to, 'kotlin.String');
    assert.strictEqual(result.appliedMappings[0].path, 'Parameters<Test["setName"]>[0]');
  });

  test('should track path for property types', () => {
    const dtsInput = `interface Test {
  name: String;
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
    name: kotlin.String;
}
`;
    assert.strictEqual(output, expectedOutput);
    assert.strictEqual(result.appliedMappings.length, 1);
    assert.strictEqual(result.appliedMappings[0].from, 'String');
    assert.strictEqual(result.appliedMappings[0].to, 'kotlin.String');
    assert.strictEqual(result.appliedMappings[0].path, 'Test["name"]');
  });

  test('should track path for multiple parameters', () => {
    const dtsInput = `interface Test {
  compare(a: String, b: int): boolean;
}`;
    
    const typeMap = new Map<string, TypeMapping>([
      ['String', { kotlinType: 'kotlin.String', nullable: '' }],
      ['int', { kotlinType: 'kotlin.Int', nullable: '' }],
      ['boolean', { kotlinType: 'kotlin.Boolean', nullable: '' }]
    ]);
    
    const sourceFile = ts.createSourceFile('test.d.ts', dtsInput, ts.ScriptTarget.Latest, true);
    const result = transformTypesInAST(sourceFile, typeMap);
    
    const printer = ts.createPrinter();
    const output = printer.printFile(result.transformed);
    
    // Verify the entire output string
    const expectedOutput = `interface Test {
    compare(a: kotlin.String, b: kotlin.Int): kotlin.Boolean;
}
`;
    assert.strictEqual(output, expectedOutput);
    assert.strictEqual(result.appliedMappings.length, 3);
    
    // Check parameter paths include index
    const stringParam = result.appliedMappings.find(m => m.from === 'String');
    const intParam = result.appliedMappings.find(m => m.from === 'int');
    const boolReturn = result.appliedMappings.find(m => m.from === 'boolean');
    
    assert.ok(stringParam);
    assert.ok(intParam);
    assert.ok(boolReturn);
    assert.strictEqual(stringParam.path, 'Parameters<Test["compare"]>[0]');
    assert.strictEqual(intParam.path, 'Parameters<Test["compare"]>[1]');
    assert.strictEqual(boolReturn.path, 'ReturnType<Test["compare"]>');
  });
});

describe('transformTypesInAST - SortedMap integration test', () => {
  test('should correctly map SortedMap types when using getJavaDef', async () => {
    const getJavaDefModule = await import('./get-java-def.ts');
    const { parseJavaDef } = await import('./mappings.ts');
    const { buildTypeMappings } = await import('./map-java-to-kotlin.ts');
    
    // Get the Java definition of SortedMap from Android docs
    const javaDef = await getJavaDefModule.getJavaDef('java.util.SortedMap');
    
    // Parse it
    const parsed = parseJavaDef(javaDef);
    
    // Verify the parsed structure
    assert.strictEqual(parsed.name, 'SortedMap', 'Should parse SortedMap name');
    assert.strictEqual(parsed.kind, 'interface', 'Should be an interface');
    assert.strictEqual(parsed.package, 'java.util', 'Should be in java.util package');
    
    // Verify key methods exist
    const methodNames = parsed.members.filter(m => m.kind === 'method').map(m => m.name);
    assert.ok(methodNames.includes('entrySet'), 'Should have entrySet method');
    assert.ok(methodNames.includes('keySet'), 'Should have keySet method');
    assert.ok(methodNames.includes('values'), 'Should have values method');
    
    // Verify super types
    assert.ok(parsed.super.length > 0, 'Should extend other interfaces');
    assert.ok(parsed.super.some(s => s.includes('Map')), 'Should extend Map');
    
    // Check that type mappings are available for the key types
    const typeMap = buildTypeMappings();
    assert.ok(typeMap.has('java.util.Map'), 'Should have mapping for java.util.Map');
    assert.ok(typeMap.has('java.util.Set'), 'Should have mapping for java.util.Set');
    assert.ok(typeMap.has('java.util.Collection'), 'Should have mapping for java.util.Collection');
    
    // Verify the mappings
    const mapMapping = typeMap.get('java.util.Map');
    const setMapping = typeMap.get('java.util.Set');
    const collectionMapping = typeMap.get('java.util.Collection');
    
    assert.ok(mapMapping?.kotlinType.includes('MutableMap'), 'Map should map to MutableMap');
    assert.ok(setMapping?.kotlinType.includes('MutableSet'), 'Set should map to MutableSet');
    assert.ok(collectionMapping?.kotlinType.includes('MutableCollection'), 'Collection should map to MutableCollection');
    
    console.log('\n=== SortedMap parsed successfully ===');
    console.log('Package:', parsed.package);
    console.log('Name:', parsed.name);
    console.log('Kind:', parsed.kind);
    console.log('Super types:', parsed.super);
    console.log('Methods:', methodNames);
    console.log('\n=== Type mappings verified ===');
    console.log('Map ->', mapMapping?.kotlinType);
    console.log('Set ->', setMapping?.kotlinType);
    console.log('Collection ->', collectionMapping?.kotlinType);
  });
});

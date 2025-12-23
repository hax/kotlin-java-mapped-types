/**
 * Tests for the Java to Kotlin type mapper
 * Using Node.js built-in test framework
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseJavaDef, javaTypeToDTS } from '../lib/mappings.ts';

describe('parseJavaDef', () => {
  test('should parse a simple interface', () => {
    const javaCode = `package java.util;

public interface SortedMap implements Map<K, V> {
    public abstract Set<K> keySet();
}`;
    
    const result = parseJavaDef(javaCode);
    
    assert.strictEqual(result.package, 'java.util');
    assert.strictEqual(result.name, 'SortedMap');
    assert.strictEqual(result.kind, 'interface');
    assert.strictEqual(result.members.length, 1);
    assert.strictEqual(result.members[0].name, 'keySet');
  });

  test('should parse a class with extends', () => {
    const javaCode = `package java.util;

public class ArrayList extends AbstractList implements List {
    public boolean add(Object e);
}`;
    
    const result = parseJavaDef(javaCode);
    
    assert.strictEqual(result.package, 'java.util');
    assert.strictEqual(result.name, 'ArrayList');
    assert.strictEqual(result.kind, 'class');
    assert.strictEqual(result.super.length, 2);
    assert.strictEqual(result.super[0], 'AbstractList');
    assert.strictEqual(result.super[1], 'List');
  });

  test('should handle methods with parameters', () => {
    const javaCode = `package com.example;

public class Test {
    public void doSomething(int x, String y);
}`;
    
    const result = parseJavaDef(javaCode);
    
    assert.strictEqual(result.members.length, 1);
    assert.strictEqual(result.members[0].kind, 'method');
    assert.strictEqual(result.members[0].name, 'doSomething');
  });
});

describe('javaTypeToDTS', () => {
  test('should convert interface to d.ts format', () => {
    const javaCode = `package java.util;

public interface SortedMap implements Map<K, V> {
    public abstract Set<K> keySet();
}`;
    
    const parsed = parseJavaDef(javaCode);
    const dts = javaTypeToDTS(parsed);
    
    assert.ok(dts.includes('interface SortedMap'));
    assert.ok(dts.includes('Package: java.util'));
    assert.ok(dts.includes('keySet'));
  });

  test('should handle class with extends and implements', () => {
    const javaCode = `package java.util;

public final class ArrayList extends AbstractList implements List {
    public boolean add(Object e);
}`;
    
    const parsed = parseJavaDef(javaCode);
    const dts = javaTypeToDTS(parsed);
    
    assert.ok(dts.includes('class ArrayList'));
    assert.ok(dts.includes('extends AbstractList'));
    assert.ok(dts.includes('implements List'));
    assert.ok(dts.includes('final'));
  });

  test('should not have semicolons at end of member lines', () => {
    const javaCode = `package java.util;

public interface Test {
    public void method();
}`;
    
    const parsed = parseJavaDef(javaCode);
    const dts = javaTypeToDTS(parsed);
    
    // Check that there are no semicolons after method declarations
    const lines = dts.split('\n');
    const methodLine = lines.find(line => line.includes('method'));
    assert.ok(methodLine);
    assert.ok(!methodLine?.trim().endsWith(';'));
  });

  test('should keep public modifier', () => {
    const javaCode = `package java.util;

public interface Test {
    public void method();
}`;
    
    const parsed = parseJavaDef(javaCode);
    const dts = javaTypeToDTS(parsed);
    
    assert.ok(dts.includes('public'));
  });

  test('should use JSDoc format for package', () => {
    const javaCode = `package com.example;

public class Test {
}`;
    
    const parsed = parseJavaDef(javaCode);
    const dts = javaTypeToDTS(parsed);
    
    assert.ok(dts.includes('/**'));
    assert.ok(dts.includes('@packageDocumentation'));
    assert.ok(dts.includes('Package: com.example'));
    assert.ok(dts.includes('*/'));
  });
});

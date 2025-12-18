/**
 * Kotlin type signatures database
 * 
 * NOTE: This is a FALLBACK cache based on official Kotlin API documentation.
 * The primary source should be fetching from official API docs at runtime.
 * See fetch-kotlin-api.ts for the fetching logic.
 * 
 * This database is used when:
 * 1. Official API documentation is unavailable
 * 2. Network fetch fails
 * 3. For development/testing without network access
 */

export interface PropertySignature {
  modifiers: string[];
  name: string;
  type: string;
}

export interface FunctionSignature {
  modifiers: string[];
  returnType: string;
  name: string;
  parameters: string[];
}

export interface KotlinTypeInfo {
  kind: 'class' | 'interface';
  modifiers: string[];
  extends?: string;
  implements?: string[];
  properties: PropertySignature[];
  functions: FunctionSignature[];
}

export const KOTLIN_TYPES: Record<string, KotlinTypeInfo> = {
  'kotlin.Any': {
    kind: 'class',
    modifiers: ['open'],
    properties: [],
    functions: [
      { modifiers: ['open'], returnType: 'Boolean', name: 'equals', parameters: ['other: Any?'] },
      { modifiers: ['open'], returnType: 'Int', name: 'hashCode', parameters: [] },
      { modifiers: ['open'], returnType: 'String', name: 'toString', parameters: [] },
    ]
  },
  'kotlin.String': {
    kind: 'class',
    modifiers: [],
    implements: ['Comparable<String>', 'CharSequence'],
    properties: [
      { modifiers: [], name: 'length', type: 'Int' },
    ],
    functions: [
      { modifiers: ['operator'], returnType: 'Char', name: 'get', parameters: ['index: Int'] },
      { modifiers: ['override'], returnType: 'Int', name: 'compareTo', parameters: ['other: String'] },
      { modifiers: ['override'], returnType: 'Boolean', name: 'equals', parameters: ['other: Any?'] },
      { modifiers: ['override'], returnType: 'Int', name: 'hashCode', parameters: [] },
      { modifiers: ['override'], returnType: 'String', name: 'toString', parameters: [] },
      { modifiers: [], returnType: 'String', name: 'substring', parameters: ['startIndex: Int'] },
      { modifiers: [], returnType: 'String', name: 'substring', parameters: ['startIndex: Int', 'endIndex: Int'] },
      { modifiers: [], returnType: 'Boolean', name: 'startsWith', parameters: ['prefix: String'] },
      { modifiers: [], returnType: 'Boolean', name: 'endsWith', parameters: ['suffix: String'] },
      { modifiers: [], returnType: 'Int', name: 'indexOf', parameters: ['char: Char'] },
      { modifiers: [], returnType: 'Int', name: 'lastIndexOf', parameters: ['char: Char'] },
      { modifiers: [], returnType: 'Boolean', name: 'contains', parameters: ['other: CharSequence'] },
      { modifiers: [], returnType: 'String', name: 'replace', parameters: ['oldChar: Char', 'newChar: Char'] },
      { modifiers: [], returnType: 'String', name: 'toLowerCase', parameters: [] },
      { modifiers: [], returnType: 'String', name: 'toUpperCase', parameters: [] },
      { modifiers: [], returnType: 'String', name: 'trim', parameters: [] },
      { modifiers: [], returnType: 'List<String>', name: 'split', parameters: ['regex: Regex'] },
    ]
  },
  'kotlin.CharSequence': {
    kind: 'interface',
    modifiers: [],
    properties: [
      { modifiers: [], name: 'length', type: 'Int' },
    ],
    functions: [
      { modifiers: ['operator'], returnType: 'Char', name: 'get', parameters: ['index: Int'] },
      { modifiers: [], returnType: 'CharSequence', name: 'subSequence', parameters: ['startIndex: Int', 'endIndex: Int'] },
      { modifiers: [], returnType: 'String', name: 'toString', parameters: [] },
    ]
  },
  'kotlin.collections.List': {
    kind: 'interface',
    modifiers: [],
    extends: 'Collection<E>',
    properties: [
      { modifiers: [], name: 'size', type: 'Int' },
    ],
    functions: [
      { modifiers: [], returnType: 'Boolean', name: 'contains', parameters: ['element: E'] },
      { modifiers: [], returnType: 'Boolean', name: 'containsAll', parameters: ['elements: Collection<E>'] },
      { modifiers: ['operator'], returnType: 'E', name: 'get', parameters: ['index: Int'] },
      { modifiers: [], returnType: 'Int', name: 'indexOf', parameters: ['element: E'] },
      { modifiers: [], returnType: 'Boolean', name: 'isEmpty', parameters: [] },
      { modifiers: [], returnType: 'Iterator<E>', name: 'iterator', parameters: [] },
      { modifiers: [], returnType: 'Int', name: 'lastIndexOf', parameters: ['element: E'] },
      { modifiers: [], returnType: 'ListIterator<E>', name: 'listIterator', parameters: [] },
      { modifiers: [], returnType: 'List<E>', name: 'subList', parameters: ['fromIndex: Int', 'toIndex: Int'] },
    ]
  },
  'kotlin.collections.MutableList': {
    kind: 'interface',
    modifiers: [],
    extends: 'List<E>',
    implements: ['MutableCollection<E>'],
    properties: [
      { modifiers: [], name: 'size', type: 'Int' },
    ],
    functions: [
      { modifiers: [], returnType: 'Boolean', name: 'add', parameters: ['element: E'] },
      { modifiers: [], returnType: 'Unit', name: 'add', parameters: ['index: Int', 'element: E'] },
      { modifiers: [], returnType: 'Boolean', name: 'addAll', parameters: ['elements: Collection<E>'] },
      { modifiers: [], returnType: 'Unit', name: 'clear', parameters: [] },
      { modifiers: [], returnType: 'Boolean', name: 'contains', parameters: ['element: E'] },
      { modifiers: [], returnType: 'Boolean', name: 'containsAll', parameters: ['elements: Collection<E>'] },
      { modifiers: ['operator'], returnType: 'E', name: 'get', parameters: ['index: Int'] },
      { modifiers: [], returnType: 'Int', name: 'indexOf', parameters: ['element: E'] },
      { modifiers: [], returnType: 'Boolean', name: 'isEmpty', parameters: [] },
      { modifiers: [], returnType: 'MutableIterator<E>', name: 'iterator', parameters: [] },
      { modifiers: [], returnType: 'Int', name: 'lastIndexOf', parameters: ['element: E'] },
      { modifiers: [], returnType: 'MutableListIterator<E>', name: 'listIterator', parameters: [] },
      { modifiers: [], returnType: 'Boolean', name: 'remove', parameters: ['element: E'] },
      { modifiers: [], returnType: 'Boolean', name: 'removeAll', parameters: ['elements: Collection<E>'] },
      { modifiers: [], returnType: 'E', name: 'removeAt', parameters: ['index: Int'] },
      { modifiers: [], returnType: 'Boolean', name: 'retainAll', parameters: ['elements: Collection<E>'] },
      { modifiers: ['operator'], returnType: 'E', name: 'set', parameters: ['index: Int', 'element: E'] },
      { modifiers: [], returnType: 'MutableList<E>', name: 'subList', parameters: ['fromIndex: Int', 'toIndex: Int'] },
    ]
  },
  'kotlin.collections.Map': {
    kind: 'interface',
    modifiers: [],
    properties: [
      { modifiers: [], name: 'size', type: 'Int' },
      { modifiers: [], name: 'entries', type: 'Set<Map.Entry<K, V>>' },
      { modifiers: [], name: 'keys', type: 'Set<K>' },
      { modifiers: [], name: 'values', type: 'Collection<V>' },
    ],
    functions: [
      { modifiers: [], returnType: 'Boolean', name: 'containsKey', parameters: ['key: K'] },
      { modifiers: [], returnType: 'Boolean', name: 'containsValue', parameters: ['value: V'] },
      { modifiers: ['operator'], returnType: 'V?', name: 'get', parameters: ['key: K'] },
      { modifiers: [], returnType: 'Boolean', name: 'isEmpty', parameters: [] },
    ]
  },
  'kotlin.collections.Map.Entry': {
    kind: 'interface',
    modifiers: [],
    properties: [
      { modifiers: [], name: 'key', type: 'K' },
      { modifiers: [], name: 'value', type: 'V' },
    ],
    functions: []
  },
  'kotlin.collections.MutableMap': {
    kind: 'interface',
    modifiers: [],
    extends: 'Map<K, V>',
    properties: [
      { modifiers: [], name: 'size', type: 'Int' },
      { modifiers: [], name: 'entries', type: 'MutableSet<MutableMap.MutableEntry<K, V>>' },
      { modifiers: [], name: 'keys', type: 'MutableSet<K>' },
      { modifiers: [], name: 'values', type: 'MutableCollection<V>' },
    ],
    functions: [
      { modifiers: [], returnType: 'Unit', name: 'clear', parameters: [] },
      { modifiers: [], returnType: 'Boolean', name: 'containsKey', parameters: ['key: K'] },
      { modifiers: [], returnType: 'Boolean', name: 'containsValue', parameters: ['value: V'] },
      { modifiers: ['operator'], returnType: 'V?', name: 'get', parameters: ['key: K'] },
      { modifiers: [], returnType: 'Boolean', name: 'isEmpty', parameters: [] },
      { modifiers: [], returnType: 'V?', name: 'put', parameters: ['key: K', 'value: V'] },
      { modifiers: [], returnType: 'Unit', name: 'putAll', parameters: ['from: Map<out K, V>'] },
      { modifiers: [], returnType: 'V?', name: 'remove', parameters: ['key: K'] },
    ]
  },
  'kotlin.collections.MutableMap.MutableEntry': {
    kind: 'interface',
    modifiers: [],
    extends: 'Map.Entry<K, V>',
    properties: [
      { modifiers: [], name: 'key', type: 'K' },
      { modifiers: ['override', 'var'], name: 'value', type: 'V' },
    ],
    functions: [
      { modifiers: [], returnType: 'V', name: 'setValue', parameters: ['newValue: V'] },
    ]
  },
};

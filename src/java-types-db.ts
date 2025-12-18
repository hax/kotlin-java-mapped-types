/**
 * Java type signatures database
 * 
 * NOTE: This is a FALLBACK cache based on official Java API documentation.
 * The primary source should be fetching from official API docs at runtime.
 * See fetch-java-api.ts for the fetching logic.
 * 
 * This database is used when:
 * 1. Official API documentation is unavailable
 * 2. Network fetch fails
 * 3. For development/testing without network access
 */

export interface MethodSignature {
  modifiers: string[];
  returnType: string;
  name: string;
  parameters: string[];
}

export interface TypeInfo {
  kind: 'class' | 'interface';
  modifiers: string[];
  extends?: string;
  implements?: string[];
  methods: MethodSignature[];
}

export const JAVA_TYPES: Record<string, TypeInfo> = {
  'java.lang.Object': {
    kind: 'class',
    modifiers: ['public'],
    methods: [
      { modifiers: ['public'], returnType: 'boolean', name: 'equals', parameters: ['Object obj'] },
      { modifiers: ['public'], returnType: 'Class<?>', name: 'getClass', parameters: [] },
      { modifiers: ['public'], returnType: 'int', name: 'hashCode', parameters: [] },
      { modifiers: ['public'], returnType: 'String', name: 'toString', parameters: [] },
      { modifiers: ['protected'], returnType: 'Object', name: 'clone', parameters: [] },
      { modifiers: ['public', 'final'], returnType: 'void', name: 'notify', parameters: [] },
      { modifiers: ['public', 'final'], returnType: 'void', name: 'notifyAll', parameters: [] },
      { modifiers: ['public', 'final'], returnType: 'void', name: 'wait', parameters: [] },
    ]
  },
  'java.lang.String': {
    kind: 'class',
    modifiers: ['public', 'final'],
    implements: ['java.io.Serializable', 'Comparable<String>', 'CharSequence'],
    methods: [
      { modifiers: ['public'], returnType: 'char', name: 'charAt', parameters: ['int index'] },
      { modifiers: ['public'], returnType: 'int', name: 'compareTo', parameters: ['String anotherString'] },
      { modifiers: ['public'], returnType: 'String', name: 'concat', parameters: ['String str'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'contains', parameters: ['CharSequence s'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'endsWith', parameters: ['String suffix'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'equals', parameters: ['Object anObject'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'equalsIgnoreCase', parameters: ['String anotherString'] },
      { modifiers: ['public'], returnType: 'int', name: 'hashCode', parameters: [] },
      { modifiers: ['public'], returnType: 'int', name: 'indexOf', parameters: ['int ch'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'isEmpty', parameters: [] },
      { modifiers: ['public'], returnType: 'int', name: 'lastIndexOf', parameters: ['int ch'] },
      { modifiers: ['public'], returnType: 'int', name: 'length', parameters: [] },
      { modifiers: ['public'], returnType: 'String', name: 'replace', parameters: ['char oldChar', 'char newChar'] },
      { modifiers: ['public'], returnType: 'String[]', name: 'split', parameters: ['String regex'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'startsWith', parameters: ['String prefix'] },
      { modifiers: ['public'], returnType: 'String', name: 'substring', parameters: ['int beginIndex'] },
      { modifiers: ['public'], returnType: 'String', name: 'toLowerCase', parameters: [] },
      { modifiers: ['public'], returnType: 'String', name: 'toUpperCase', parameters: [] },
      { modifiers: ['public'], returnType: 'String', name: 'toString', parameters: [] },
      { modifiers: ['public'], returnType: 'String', name: 'trim', parameters: [] },
    ]
  },
  'java.lang.CharSequence': {
    kind: 'interface',
    modifiers: ['public'],
    methods: [
      { modifiers: ['public'], returnType: 'char', name: 'charAt', parameters: ['int index'] },
      { modifiers: ['public'], returnType: 'int', name: 'length', parameters: [] },
      { modifiers: ['public'], returnType: 'CharSequence', name: 'subSequence', parameters: ['int start', 'int end'] },
      { modifiers: ['public'], returnType: 'String', name: 'toString', parameters: [] },
    ]
  },
  'java.util.List': {
    kind: 'interface',
    modifiers: ['public'],
    extends: 'java.util.Collection',
    methods: [
      { modifiers: ['public'], returnType: 'boolean', name: 'add', parameters: ['E e'] },
      { modifiers: ['public'], returnType: 'void', name: 'add', parameters: ['int index', 'E element'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'addAll', parameters: ['Collection<? extends E> c'] },
      { modifiers: ['public'], returnType: 'void', name: 'clear', parameters: [] },
      { modifiers: ['public'], returnType: 'boolean', name: 'contains', parameters: ['Object o'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'containsAll', parameters: ['Collection<?> c'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'equals', parameters: ['Object o'] },
      { modifiers: ['public'], returnType: 'E', name: 'get', parameters: ['int index'] },
      { modifiers: ['public'], returnType: 'int', name: 'hashCode', parameters: [] },
      { modifiers: ['public'], returnType: 'int', name: 'indexOf', parameters: ['Object o'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'isEmpty', parameters: [] },
      { modifiers: ['public'], returnType: 'Iterator<E>', name: 'iterator', parameters: [] },
      { modifiers: ['public'], returnType: 'int', name: 'lastIndexOf', parameters: ['Object o'] },
      { modifiers: ['public'], returnType: 'ListIterator<E>', name: 'listIterator', parameters: [] },
      { modifiers: ['public'], returnType: 'boolean', name: 'remove', parameters: ['Object o'] },
      { modifiers: ['public'], returnType: 'E', name: 'remove', parameters: ['int index'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'removeAll', parameters: ['Collection<?> c'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'retainAll', parameters: ['Collection<?> c'] },
      { modifiers: ['public'], returnType: 'E', name: 'set', parameters: ['int index', 'E element'] },
      { modifiers: ['public'], returnType: 'int', name: 'size', parameters: [] },
      { modifiers: ['public'], returnType: 'List<E>', name: 'subList', parameters: ['int fromIndex', 'int toIndex'] },
      { modifiers: ['public'], returnType: 'Object[]', name: 'toArray', parameters: [] },
    ]
  },
  'java.util.Map': {
    kind: 'interface',
    modifiers: ['public'],
    methods: [
      { modifiers: ['public'], returnType: 'void', name: 'clear', parameters: [] },
      { modifiers: ['public'], returnType: 'boolean', name: 'containsKey', parameters: ['Object key'] },
      { modifiers: ['public'], returnType: 'boolean', name: 'containsValue', parameters: ['Object value'] },
      { modifiers: ['public'], returnType: 'Set<Map.Entry<K, V>>', name: 'entrySet', parameters: [] },
      { modifiers: ['public'], returnType: 'boolean', name: 'equals', parameters: ['Object o'] },
      { modifiers: ['public'], returnType: 'V', name: 'get', parameters: ['Object key'] },
      { modifiers: ['public'], returnType: 'int', name: 'hashCode', parameters: [] },
      { modifiers: ['public'], returnType: 'boolean', name: 'isEmpty', parameters: [] },
      { modifiers: ['public'], returnType: 'Set<K>', name: 'keySet', parameters: [] },
      { modifiers: ['public'], returnType: 'V', name: 'put', parameters: ['K key', 'V value'] },
      { modifiers: ['public'], returnType: 'void', name: 'putAll', parameters: ['Map<? extends K, ? extends V> m'] },
      { modifiers: ['public'], returnType: 'V', name: 'remove', parameters: ['Object key'] },
      { modifiers: ['public'], returnType: 'int', name: 'size', parameters: [] },
      { modifiers: ['public'], returnType: 'Collection<V>', name: 'values', parameters: [] },
    ]
  },
  'java.util.Map.Entry': {
    kind: 'interface',
    modifiers: ['public', 'static'],
    methods: [
      { modifiers: ['public'], returnType: 'boolean', name: 'equals', parameters: ['Object o'] },
      { modifiers: ['public'], returnType: 'K', name: 'getKey', parameters: [] },
      { modifiers: ['public'], returnType: 'V', name: 'getValue', parameters: [] },
      { modifiers: ['public'], returnType: 'int', name: 'hashCode', parameters: [] },
      { modifiers: ['public'], returnType: 'V', name: 'setValue', parameters: ['V value'] },
    ]
  },
};

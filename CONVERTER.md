# Java to Kotlin Type Converter

This tool converts Java type definitions to Kotlin type definitions based on the documented mapping relationships between Java and Kotlin types.

## Features

- **Type Conversion**: Automatically converts Java types to their Kotlin equivalents
  - Handles primitive types (int → Int, boolean → Boolean, etc.)
  - Converts collection types (java.util.List → kotlin.collections.List)
  - Supports generic type parameters
- **Interface and Superclass Conversion**: Transforms `extends` and `implements` clauses
- **Member Mapping**: Converts methods and properties according to Kotlin conventions
  - Java getter methods → Kotlin properties (e.g., `length()` → `length`)
  - Java accessor patterns → Kotlin properties (e.g., `getMessage()` → `message`)
  - Collection methods → Kotlin properties (e.g., `keySet()` → `keys`)
  - Special operators (e.g., `charAt(int)` → `get(index: Int)`)

## Usage

### Command Line

```bash
# Convert a single Java type to Kotlin
npm run convert java.util.SortedMap

# Or use node directly
node lib/cli/convert-to-kotlin.ts java.lang.String
```

### Programmatic API

```typescript
import { convertJavaToKotlin } from './lib/convert-java-to-kotlin.ts';
import { getJavaDef } from './lib/get-java-def.ts';

// Fetch Java definition
const javaDefContent = await getJavaDef('java.util.Map');

// Convert to Kotlin
const result = await convertJavaToKotlin(javaDefContent);

console.log(result.kotlinDef);
console.log('Unmapped types:', result.unmappedTypes);
console.log('Unmapped members:', result.unmappedMembers);
```

## Examples

### Example 1: java.util.SortedMap

**Input (Java):**
```java
package java.util;

public interface SortedMap implements Map<K, V>, SequencedMap<K, V> {
    public abstract Comparator<? super K> comparator ();
    public abstract Set<Entry<K, V>> entrySet ();
    public abstract K firstKey ();
    public abstract SortedMap<K, V> headMap (K toKey);
    public abstract Set<K> keySet ();
    public abstract K lastKey ();
    public SortedMap<K, V> subMap (K fromKey, K toKey);
    public SortedMap<K, V> tailMap (K fromKey);
    public abstract Collection<V> values ();
}
```

**Output (Kotlin):**
```kotlin
package kotlin.collections

interface SortedMap : kotlin.collections.MutableMap<K, V>, SequencedMap<K, V> {
    public abstract fun comparator(): Comparator<? super K>
    public abstract fun entrySet(): Set<Entry<K, V>>
    public abstract fun firstKey(): K
    public abstract fun headMap(K toKey): SortedMap<K, V>
    public abstract fun keySet(): Set<K>
    public abstract fun lastKey(): K
    public abstract fun subMap(K fromKey, K toKey): SortedMap<K, V>
    public abstract fun tailMap(K fromKey): SortedMap<K, V>
    public abstract fun values(): Collection<V>
}
```

### Example 2: java.util.Map (with Member Mappings)

**Input (Java):**
```java
package java.util;

public interface Map {
    public abstract Set<K> keySet ();
    public abstract Set<Entry<K, V>> entrySet ();
    public abstract Collection<V> values ();
    public abstract int size ();
    // ... other methods
}
```

**Output (Kotlin):**
```kotlin
package kotlin.collections

interface MutableMap {
    public override val keys: MutableSet<K>
    public override val entries: MutableSet<MutableMap.MutableEntry<K, V>>
    public override val values: MutableCollection<V>
    public abstract fun size(): kotlin.Int
    // ... other methods
}
```

Note how:
- `keySet()` → `keys` (property)
- `entrySet()` → `entries` (property)
- `values()` → `values` (property)

### Example 3: java.lang.String

**Input (Java):**
```java
package java.lang;

public final class String implements CharSequence, Comparable<String> {
    public int length();
    public char charAt(int index);
    public String substring(int beginIndex);
    // ... other methods
}
```

**Output (Kotlin):**
```kotlin
package kotlin

class String : kotlin.CharSequence, kotlin.Comparable<kotlin.String> {
    public override val length: Int
    public override fun get(index: Int): Char
    public fun substring(beginIndex: Int): String
    // ... other methods
}
```

Note how:
- `length()` → `length` (property)
- `charAt(int)` → `get(index: Int)` (operator function)

## How It Works

The converter follows this process:

1. **Parse Java Definition**: Extract package, type name, superclasses, interfaces, and members
2. **Load Type Mappings**: Build a map of Java types to Kotlin types from the official mappings
3. **Convert Types**: Transform type names using the mapping table, handling:
   - Qualified type names (e.g., `java.util.Map`)
   - Unqualified type names using package context
   - Generic type parameters
4. **Load Member Mappings**: If available, load pre-calculated member mappings from generated definition files
5. **Convert Members**:
   - Apply member mappings for known conversions
   - Convert method signatures (parameter types, return types)
   - Transform modifiers (public, abstract, etc.)
6. **Generate Kotlin Definition**: Format the converted type as Kotlin code

## Limitations

- **Static Members**: Currently skipped (would need to go in companion object)
- **Constructors**: Currently not converted
- **Unmapped Types**: Types not in the official mapping list are left as-is
- **Complex Generics**: Nested generics may not be perfectly converted
- **Newer Java Types**: Types like `SequencedMap` that don't have Kotlin equivalents are reported as unmapped

## Future Enhancements

- Add support for constructors
- Handle static members in companion objects
- Improve generic type parameter conversion
- Add option to output to file
- Add batch conversion mode for multiple types
- Generate complete Kotlin projects from Java code

## Related Tools

- `npm run gen:defs`: Generate type definitions from documentation
- `npm run calc:mappings`: Calculate member mappings between types
- `npm run gen:mt`: Generate mapped-types.md documentation

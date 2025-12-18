# kotlin-java-mapped-types

This project documents the mapped types between Kotlin and Java as specified in the [Kotlin documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types).

## Overview

When Kotlin and Java types are used in interop scenarios, they are mapped bidirectionally. This project provides:
1. A comprehensive YAML file listing all mapped types
2. For each mapping pair, a directory containing:
   - Java type definition
   - Kotlin type definition
   - Detailed mapping YAML showing how methods and properties map between the types

## Structure

```
.
├── mapped-types.yaml          # Main YAML file with all type mappings
├── generate_mappings.py       # Script to generate mapping directories
└── mappings/                  # Generated mapping directories
    ├── kotlin_<type>_to_java_<type>/
    │   ├── java-definition.java      # Java type definition
    │   ├── kotlin-definition.kt      # Kotlin type definition
    │   └── mapping-details.yaml      # Detailed method/property mappings
    └── ...
```

## Mapped Types

The project covers 32 type mappings between Kotlin and Java:

### Primitive Types
- `kotlin.Byte` ↔ `java.lang.Byte`
- `kotlin.Short` ↔ `java.lang.Short`
- `kotlin.Int` ↔ `java.lang.Integer`
- `kotlin.Long` ↔ `java.lang.Long`
- `kotlin.Char` ↔ `java.lang.Character`
- `kotlin.Float` ↔ `java.lang.Float`
- `kotlin.Double` ↔ `java.lang.Double`
- `kotlin.Boolean` ↔ `java.lang.Boolean`

### Common Types
- `kotlin.Any` ↔ `java.lang.Object`
- `kotlin.String` ↔ `java.lang.String`
- `kotlin.CharSequence` ↔ `java.lang.CharSequence`
- `kotlin.Throwable` ↔ `java.lang.Throwable`

### Interfaces
- `kotlin.Cloneable` ↔ `java.lang.Cloneable`
- `kotlin.Comparable` ↔ `java.lang.Comparable`
- `kotlin.Enum` ↔ `java.lang.Enum`
- `kotlin.Annotation` ↔ `java.lang.annotation.Annotation`

### Collections (Read-only)
- `kotlin.collections.Iterator` ↔ `java.util.Iterator`
- `kotlin.collections.Iterable` ↔ `java.lang.Iterable`
- `kotlin.collections.Collection` ↔ `java.util.Collection`
- `kotlin.collections.Set` ↔ `java.util.Set`
- `kotlin.collections.List` ↔ `java.util.List`
- `kotlin.collections.ListIterator` ↔ `java.util.ListIterator`
- `kotlin.collections.Map` ↔ `java.util.Map`
- `kotlin.collections.Map.Entry` ↔ `java.util.Map.Entry`

### Collections (Mutable)
- `kotlin.collections.MutableIterator` ↔ `java.util.Iterator`
- `kotlin.collections.MutableIterable` ↔ `java.lang.Iterable`
- `kotlin.collections.MutableCollection` ↔ `java.util.Collection`
- `kotlin.collections.MutableSet` ↔ `java.util.Set`
- `kotlin.collections.MutableList` ↔ `java.util.List`
- `kotlin.collections.MutableListIterator` ↔ `java.util.ListIterator`
- `kotlin.collections.MutableMap` ↔ `java.util.Map`
- `kotlin.collections.MutableMap.MutableEntry` ↔ `java.util.Map.Entry`

## Detailed Mappings

Each mapping directory contains a `mapping-details.yaml` file that shows:

### Property to Method Mappings
Kotlin properties often map to Java methods. For example:
- `kotlin.String.length` (property) → `java.lang.String.length()` (method)
- `kotlin.collections.List.size` (property) → `java.util.List.size()` (method)
- `kotlin.collections.Map.Entry.key` (property) → `java.util.Map.Entry.getKey()` (method)

### Method Mappings
Some Kotlin methods have different names than their Java equivalents:
- `kotlin.String.get()` → `java.lang.String.charAt()` (operator function)

### Direct Mappings
Most methods map directly with the same name:
- `equals()`, `hashCode()`, `toString()` map directly between types

## Usage

To regenerate the mappings:

```bash
python3 generate_mappings.py
```

This will read `mapped-types.yaml` and generate all mapping directories under `mappings/`.

## Example

For the `kotlin.collections.List` ↔ `java.util.List` mapping:

**Java Definition** (`java-definition.java`):
```java
package java.util;

public interface List extends java.util.Collection {
    // size()
    // get()
    // add()
    // ...
}
```

**Kotlin Definition** (`kotlin-definition.kt`):
```kotlin
package kotlin.collections

interface List : kotlin.collections.Collection {
    val size: Any // property
    fun get() // method
    fun add() // method
    // ...
}
```

**Mapping Details** (`mapping-details.yaml`):
```yaml
kotlin_type: kotlin.collections.List
java_type: java.util.List
property_mappings:
- kotlin_property: size
  java_method: size
  note: Kotlin property maps to Java method
method_mappings:
- kotlin_method: get
  java_method: get
  note: Direct method mapping
# ...
```

## References

- [Kotlin Java Interop Documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types)
- [Kotlin Collections Documentation](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/)
- [Java API Documentation](https://docs.oracle.com/en/java/javase/11/docs/api/)
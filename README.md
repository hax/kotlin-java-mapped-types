# Kotlin-Java Mapped Types

Documentation generator for Kotlin-Java type mappings with TypeScript/Node.js.

## Overview

This project generates comprehensive documentation for the 32 type mappings between Kotlin and Java as specified in the [Kotlin documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types).

Type information is fetched directly from official API documentation:
- **Java types**: [Android Developer Documentation](https://developer.android.com/reference/)
- **Kotlin types**: [Kotlin API Reference](https://kotlinlang.org/api/core/kotlin-stdlib/)

## Quick Start

### Prerequisites

- Node.js >= 22.0.0 (for native TypeScript support)

### Installation

```bash
npm install
```

### Generate Mappings

```bash
# Generate all type mappings
npm run generate

# Generate only mapping details from existing definitions
npm run generate:mapping-details

# Aggregate all mappings into mapped-types.yaml
npm run generate:mapped-types
```

## Project Structure

```
.
├── lib/                          # TypeScript source files
│   ├── extract-mapped-types.ts  # Extract mappings from Kotlin docs
│   ├── fetch-java-api.ts        # Fetch from Android docs
│   ├── fetch-kotlin-api.ts      # Fetch from Kotlin docs
│   ├── fetch-java-definition.ts # Generate Java definitions
│   ├── fetch-kotlin-definition.ts # Generate Kotlin definitions
│   ├── generate-mapping-details.ts # Create signature mappings
│   ├── generate-mapped-types-yaml.ts # Aggregate all mappings
│   └── generate-all.ts          # Main orchestrator
├── mappings/                     # Generated mapping directories
│   └── <kotlin_Type>_to_<java_Type>/
│       ├── java-definition.java     # Java type with signatures
│       ├── kotlin-definition.kt     # Kotlin type with signatures
│       └── mapping-details.yaml     # Signature-to-signature mappings
└── mapped-types.yaml             # Master mapping file (generated)
```

## Type Definitions

Type definitions are generated with complete method/function signatures fetched from official documentation.

### Java Example

```java
package java.lang;

public final class String implements java.io.Serializable, Comparable<String>, CharSequence {
    public char charAt(int index);
    public int length();
    public String substring(int beginIndex);
    // ...
}
```

### Kotlin Example

```kotlin
package kotlin

class String : Comparable<String>, CharSequence {
    val length: Int
    operator fun get(index: Int): Char
    fun substring(startIndex: Int): String
    // ...
}
```

## Mapping Details

Mappings use direct signature-to-signature comparison:

```yaml
- kotlin: "val length: Int"
  java: public int length()
- kotlin: "operator fun get(index: Int): Char"
  java: public char charAt(int index)
```

## Master YAML

The `mapped-types.yaml` file aggregates all mappings with kind and name only:

```yaml
mappings:
  - kotlin:
      kind: class
      name: kotlin.String
    java:
      kind: class
      name: java.lang.String
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

## How It Works

1. **Extract Mapped Types**: First, the list of type mappings is extracted from the official Kotlin documentation at https://kotlinlang.org/docs/java-interop.html
2. **Fetch Type Information**: Scripts fetch type signatures from official Android and Kotlin API documentation
3. **Generate Definitions**: Create Java and Kotlin definition files with complete signatures
4. **Compare Signatures**: Parse definitions and match signatures between languages
5. **Generate Mappings**: Create YAML files documenting the mappings
6. **Aggregate**: Combine all mapping information into `mapped-types.yaml`

## License

ISC

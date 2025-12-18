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
├── src/                          # TypeScript source files
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

The project covers 32 type mappings:

- **Primitives** (8): Byte, Short, Int, Long, Char, Float, Double, Boolean
- **Common Types** (4): Any, String, CharSequence, Throwable
- **Interfaces** (4): Cloneable, Comparable, Enum, Annotation
- **Read-only Collections** (8): Iterator, Iterable, Collection, Set, List, ListIterator, Map, Map.Entry
- **Mutable Collections** (8): MutableIterator, MutableIterable, MutableCollection, MutableSet, MutableList, MutableListIterator, MutableMap, MutableMap.MutableEntry

## How It Works

1. **Fetch Type Information**: Scripts fetch type signatures from official Android and Kotlin API documentation
2. **Generate Definitions**: Create Java and Kotlin definition files with complete signatures
3. **Compare Signatures**: Parse definitions and match signatures between languages
4. **Generate Mappings**: Create YAML files documenting the mappings
5. **Aggregate**: Combine all mapping information into `mapped-types.yaml`

## License

ISC

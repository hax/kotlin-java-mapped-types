# Kotlin-Java Mapped Types

Documentation generator for Kotlin-Java type mappings with TypeScript/Node.js.

## Overview

This project generates comprehensive documentation for the 32 type mappings between Kotlin and Java as specified in the [Kotlin documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types).

The project uses a **cache-based architecture**:
1. **Sync Phase**: Fetch and cache type information from official documentation in `doc-cache/`
2. **Generate Phase**: Generate mappings from cached data (offline-capable)

Type information is sourced from:
- **Java types**: [Android Developer Documentation](https://developer.android.com/reference/)
- **Kotlin types**: [Kotlin API Reference](https://kotlinlang.org/api/core/kotlin-stdlib/)

All documentation is cached in the `doc-cache/` directory and committed to the repository, enabling fully offline generation in CI environments.

## Quick Start

### Prerequisites

- Node.js >= 22.0.0 (for native TypeScript support)

### Installation

```bash
npm install
```

### Generate Mappings

```bash
# Step 1: Generate mappings from cached data (offline-capable, default mode)
npm run generate

# Step 2 (Optional): Update cache with latest documentation (requires network)
npm run sync

# Alternative: Validate cache in offline mode
npm run sync -- --offline

# Alternative: Generate only mapping details from existing definitions
npm run generate:mapping-details

# Alternative: Aggregate all mappings into mapped-types.yaml
npm run generate:mapped-types

# Alternative: Generate mapped-types-details.yaml with simplified mapping list
npm run generate:mapped-types-details
```

## Project Structure

```
.
├── lib/                          # TypeScript source files
│   ├── extract-mapped-types.ts  # Extract type mappings from Kotlin documentation
│   ├── fetch-java-api.ts        # Fetch from Android docs
│   ├── fetch-kotlin-api.ts      # Fetch from Kotlin docs
│   ├── fetch-java-definition.ts # Generate Java definitions
│   ├── fetch-kotlin-definition.ts # Generate Kotlin definitions
│   ├── generate-mapping-details.ts # Create signature mappings
│   ├── generate-mapped-types-yaml.ts # Aggregate all mappings
│   ├── generate-mapped-types-details-yaml.ts # Generate summary with simplified mappings
│   ├── generate-all.ts          # Main generator (reads from doc-cache)
│   └── sync-resources.ts        # Sync script to fetch and cache data
├── doc-cache/                    # Cached documentation (committed to repo)
│   ├── kotlin-doc.html          # Cached Kotlin interop documentation
│   ├── kotlin/                  # Cached Kotlin type definitions (HTML)
│   └── java/                    # Cached Java type definitions (HTML)
├── mappings/                     # Generated mapping directories
│   └── <kotlin_Type>_to_<java_Type>/
│       ├── java-definition.java     # Java type with signatures
│       ├── kotlin-definition.kt     # Kotlin type with signatures
│       └── mapping-details.yaml     # Signature-to-signature mappings
├── mapped-types.yaml             # Master mapping list (in root, generated from docs)
└── mapped-types-details.yaml     # Summary with simplified mapping list
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

## Mapping Details YAML

The `mapped-types-details.yaml` file extends `mapped-types.yaml` by adding a `mappings` list for each type pair, showing simplified method and property mappings (names and parameter names only, without type information):

```yaml
mappings:
  - kotlin:
      kind: class
      name: kotlin.String
    java:
      kind: class
      name: java.lang.String
    mappings:
      - kotlin: length
        java: length()
      - kotlin: get(index)
        java: charAt(index)
      - kotlin: compareTo(other)
        java: compareTo(anotherString)
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

**Sync Phase** (`npm run sync`):
1. **Fetch Documentation**: Downloads the Kotlin documentation page containing the mapped types table
2. **Extract Mapped Types**: Parses the documentation to extract the 32 type mappings and saves to `mapped-types.yaml` in root directory
3. **Fetch Type Definitions**: For each mapped type, fetches Kotlin and Java type signatures from official documentation and caches to `doc-cache/kotlin/` and `doc-cache/java/`
4. **Smart Updates**: Compares new content with existing cached files and only updates if changed
5. **Offline Mode**: Use `--offline` flag to validate cache without network access

**Generate Phase** (`npm run generate`):
1. **Read Cached Data**: Loads type mappings from `mapped-types.yaml` in root directory
2. **Parse Cached HTML**: Reads and parses cached HTML files from `doc-cache/` to extract type information
3. **Generate Definitions**: Creates formatted type definition files in individual mapping directories
4. **Compare Signatures**: Parses definitions and matches signatures between languages
5. **Generate Mappings**: Creates `mapping-details.yaml` files documenting signature-to-signature mappings
6. **Aggregate**: Combines all mapping information into the master `mapped-types.yaml`

This cache-based architecture enables fully offline generation after the initial sync. The cache is committed to the repository, so CI environments can run without network access.

## License

ISC

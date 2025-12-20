# Kotlin-Java Mapped Types

Documentation generator for Kotlin-Java type mappings with TypeScript/Node.js.

## Overview

This project generates comprehensive documentation for the 32 type mappings between Kotlin and Java as specified in the [Kotlin documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types).

The project uses a **two-phase architecture**:
1. **Sync Phase**: Fetch and cache type information from official documentation
2. **Generate Phase**: Generate mappings from cached data (offline-capable)

Type information is sourced from:
- **Java types**: [Android Developer Documentation](https://developer.android.com/reference/)
- **Kotlin types**: [Kotlin API Reference](https://kotlinlang.org/api/core/kotlin-stdlib/)

## Quick Start

### Prerequisites

- Node.js >= 18.0.0

### Installation

```bash
npm install
```

### Workflow

```bash
# Step 1: Sync data sources (requires network access)
# Fetches Kotlin documentation and type definitions, caches them in resources/
npm run sync

# Step 2: Generate mappings (works offline from cached data)
npm run generate

# Alternative: Generate only mapping details from existing definitions
npm run generate:mapping-details

# Alternative: Aggregate all mappings into mapped-types.yaml
npm run generate:mapped-types
```

### Verification

To verify the architecture is working correctly:

```bash
./verify.sh
```

This will test:
- Resources directory structure
- TypeScript compilation
- Offline generation from cached data
- Mapping aggregation

## Project Structure

```
.
├── lib/                          # TypeScript source files
│   ├── sync-resources.ts         # Sync script to fetch and cache data
│   ├── extract-mapped-types.ts  # Extract type mappings from Kotlin documentation
│   ├── fetch-java-api.ts        # Fetch from Android docs
│   ├── fetch-kotlin-api.ts      # Fetch from Kotlin docs
│   ├── fetch-java-definition.ts # Generate Java definitions
│   ├── fetch-kotlin-definition.ts # Generate Kotlin definitions
│   ├── generate-mapping-details.ts # Create signature mappings
│   ├── generate-mapped-types-yaml.ts # Aggregate all mappings
│   └── generate-all.ts          # Main generator (reads from resources)
├── resources/                    # Cached data sources (committed to git)
│   ├── kotlin-doc.html          # Cached Kotlin documentation page
│   ├── mapped-types.yaml        # List of all mapped types
│   ├── kotlin/                  # Cached Kotlin type definitions
│   │   └── *.kt                 # One file per Kotlin type
│   └── java/                    # Cached Java type definitions
│       └── *.java               # One file per Java type
├── mappings/                     # Generated mapping directories
│   └── <kotlin_Type>_to_<java_Type>/
│       ├── java-definition.java     # Java type with signatures
│       ├── kotlin-definition.kt     # Kotlin type with signatures
│       └── mapping-details.yaml     # Signature-to-signature mappings
└── mapped-types.yaml             # Master mapping file (generated)
```

## Architecture

### Two-Phase Design

**Phase 1: Sync (`npm run sync`)**
- Fetches the Kotlin documentation page containing mapped types
- Extracts the list of 32 mapped types to `resources/mapped-types.yaml`
- Fetches all Kotlin type definitions and saves to `resources/kotlin/`
- Fetches all Java type definitions and saves to `resources/java/`
- Compares with existing cached data and only updates if changed
- **Requires network access**

**Phase 2: Generate (`npm run generate`)**
- Reads cached data from `resources/` directory
- Generates mapping details by comparing Kotlin and Java signatures
- Creates output in `mappings/` directory
- Aggregates mappings into `mapped-types.yaml`
- **Works offline - no network access required**

### Benefits

- **Offline capability**: Generate mappings without network access
- **Faster iteration**: Development doesn't require repeated API calls
- **Reproducibility**: Cached data ensures consistent results
- **Version control**: Changes to upstream APIs are visible in diffs
- **Separation of concerns**: Data fetching separated from processing

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

### Sync Phase (`npm run sync`)
1. **Fetch Documentation**: Downloads the Kotlin documentation page containing the mapped types table
2. **Extract Mapped Types**: Parses the documentation to extract the 32 type mappings and saves to `resources/mapped-types.yaml`
3. **Fetch Type Definitions**: For each mapped type:
   - Fetches Kotlin type signatures from the official Kotlin API documentation
   - Fetches Java type signatures from the official Android API documentation
   - Caches both definitions in `resources/kotlin/` and `resources/java/`
4. **Smart Updates**: Compares new content with existing cached files and only updates if changed

### Generate Phase (`npm run generate`)
1. **Read Cached Data**: Loads type mappings from `resources/mapped-types.yaml`
2. **Read Type Definitions**: Loads cached Kotlin and Java definitions from `resources/`
3. **Generate Definitions**: Copies definition files to individual mapping directories in `mappings/`
4. **Compare Signatures**: Parses definitions and matches signatures between languages
5. **Generate Mappings**: Creates `mapping-details.yaml` files documenting signature-to-signature mappings
6. **Aggregate**: Combines all mapping information into the master `mapped-types.yaml`

This two-phase architecture allows the generation process to work entirely offline after the initial sync.

## License

ISC

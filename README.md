# Kotlin-Java Mapped Types

Documentation generator for Kotlin-Java type mappings with TypeScript/Node.js.

[中文文档](README.zh-CN.md) | English

## Overview

This project generates comprehensive documentation for the type mappings between Kotlin and Java as specified in the [Kotlin documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types).

Type information is automatically fetched and cached from official documentation:
- **Java types**: [Android Developer Documentation](https://developer.android.com/reference/)
- **Kotlin types**: [Kotlin API Reference](https://kotlinlang.org/api/core/kotlin-stdlib/)

The project uses automatic HTTP caching (via `make-fetch-happen`), enabling offline-capable generation after the initial fetch.

## Quick Start

### Prerequisites

- Node.js >= 24.0.0 (for native TypeScript support)

### Installation

```bash
npm install
```

### Usage

```bash
# Generate all mapped types documentation (default workflow)
npm start

# Individual commands:
# 1. Fetch mapped types list (with --offline flag to use cache only)
npm run get:mt

# 2. Generate type definitions for all mappings
npm run gen:defs

# 3. Generate mapped-types.md with detailed mappings
npm run gen:mt

# 4. Convert Java type definition to Kotlin (NEW!)
npm run convert java.util.SortedMap
```

## Java to Kotlin Converter

This project now includes a tool to convert Java type definitions to Kotlin definitions based on the mapping relationships. See [CONVERTER.md](CONVERTER.md) for detailed documentation.

**Quick Example:**
```bash
# Convert java.util.Map to Kotlin
npm run convert java.util.Map
```

The converter automatically:
- Converts type names (java.util.Map → kotlin.collections.MutableMap)
- Transforms interfaces and superclasses
- Converts methods to Kotlin syntax
- Maps Java methods to Kotlin properties where appropriate (e.g., `keySet()` → `keys`)


## Project Structure

```
.
├── lib/                          # TypeScript source files
│   ├── cli/                     # Command-line entry points
│   │   ├── gen-defs.ts          # Generate type definitions
│   │   ├── gen-mapped-types.ts  # Generate mapped-types.md
│   │   ├── calc-mappings.ts     # Calculate member mappings
│   │   ├── get-def.ts           # Get single type definition
│   │   └── get-mapped-types.ts  # Fetch mapped types list
│   ├── config.ts                # Path configuration
│   ├── utils.ts                 # Shared utilities
│   ├── fetch-text.ts            # HTTP fetch with caching
│   ├── get-java-def.ts          # Fetch and parse Java definitions
│   ├── get-kotlin-def.ts        # Fetch and parse Kotlin definitions
│   └── mappings.ts              # Parse and map type members
├── .cache/                      # HTTP cache (auto-generated)
├── .defs/                       # Generated type definitions
│   └── <java.type.Name>/
│       ├── def.java             # Java type definition
│       └── kotlin.Type.kt       # Kotlin type definition
└── mapped-types.md              # Generated documentation
```

## How It Works

1. **Fetch Mapped Types**: Extract type mapping list from [Kotlin documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types)
2. **Generate Definitions**: For each type pair:
   - Fetch HTML from Android Developer and Kotlin API documentation
   - Extract type signatures directly from HTML
   - Generate definition files with source URL headers
3. **Calculate Mappings**: Parse definition files and match corresponding members between Java and Kotlin
4. **Output Documentation**: Generate `mapped-types.md` with detailed member-to-member mappings

All HTTP requests are automatically cached using `make-fetch-happen`, enabling offline operation after initial fetch. Use `--offline` flag to ensure no network access.

## Example Output

Type definitions include complete signatures extracted from official documentation:

### Java Definition
```java
// Source: https://developer.android.com/reference/java/lang/String

package java.lang;

public final class String {
    public int length();
    public char charAt(int index);
    public String substring(int beginIndex);
}
```

### Kotlin Definition
```kotlin
// Source: https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/

package kotlin

class String {
    val length: Int
    operator fun get(index: Int): Char
    fun substring(startIndex: Int): String
}
```

### Mapped Types Documentation

The generated `mapped-types.md` shows member-by-member mappings:

```markdown
## java.lang.String <-> kotlin.String!
- length
  `public length(): int`
  `public override length: Int`
- charAt
  `public charAt(int index): char`
  `public override get(index: Int): Char`
```

## Mapped Types

The project covers all type mappings between Kotlin and Java as specified in the official Kotlin documentation:

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

## Technical Details

### Caching Strategy

The project uses `make-fetch-happen` for HTTP caching:
- First fetch downloads and caches content in `.cache/`
- Subsequent runs use cached content automatically
- Use `--offline` flag to force cache-only mode (fails if cache missing)
- Cache can be committed to repository for CI/CD environments

### Definition Extraction

**Java Types**: Parse `.api-signature` elements from Android Developer documentation HTML.

**Kotlin Types**: 
1. Parse Kotlin API documentation HTML to find source link
2. Fetch source code from GitHub
3. Extract type definition from source code starting at the line indicated in the documentation

### Member Mapping Algorithm

The mapping algorithm compares Java and Kotlin members to identify corresponding functionality:

1. **Property to Getter**: Kotlin properties map to Java getter methods (e.g., `length` → `length()`)
2. **Accessor Methods**: Java accessors map to Kotlin properties (e.g., `getMessage()` → `message`)
3. **Special Cases**: Operator functions map to specific methods (e.g., `get(index)` → `charAt(index)`)
4. **Collection Properties**: Special mappings for collections (e.g., `keySet()` → `keys`, `entrySet()` → `entries`)
5. **Conversion Methods**: Java `*Value()` methods map to Kotlin `to*()` functions

## License

ISC

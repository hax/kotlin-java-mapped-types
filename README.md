# Kotlin-Java Mapped Types

[中文文档](README.zh-CN.md) | English

## Overview

This project generates comprehensive and precise documentation for the type mappings between Kotlin and Java as specified in the [Kotlin documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types). The generated documentation can be used by tools and provides detailed member-to-member mappings.

Type information is automatically fetched from official documentation:
- **Java types**: [Android Developer Documentation](https://developer.android.com/reference/)
- **Kotlin types**: [Kotlin API Reference](https://kotlinlang.org/api/core/kotlin-stdlib/)

## Quick Start

### Prerequisites

- Node.js >= 24.0.0

### Installation

```bash
npm install
```

### Usage

```bash
# Generate all mapped types documentation (default workflow)
npm start

# Individual commands:
# 1. Fetch mapped types list
npm run get:mt

# 2. Generate type definitions for all mappings
npm run gen:defs

# 3. Generate mapped-types.md with detailed mappings
npm run gen:mt
```

**Additional options:**
- Use `--offline` flag with commands to use cached content only (e.g., `npm run get:mt -- --offline`)
- Use `--dry-run` flag to preview operations without writing files
- All HTTP requests are automatically cached, enabling offline operation after initial fetch

## How It Works

The tool follows these steps:

1. **Fetch mapped types list** from Kotlin documentation
2. **Generate type definitions** by fetching and extracting signatures from official Java and Kotlin documentation
3. **Calculate member mappings** by analyzing the definitions and matching corresponding members
4. **Output documentation** as `mapped-types.md` with detailed mappings

For more technical details about the implementation, see [TECHNICAL.md](TECHNICAL.md).

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

See the complete list of mapped types with detailed member mappings in [mapped-types.md](mapped-types.md).

# kotlin-java-mapped-types

Documentation for Kotlin-Java mapped types with TypeScript-based generation tools.

## Overview

This project documents the mapped types between Kotlin and Java as specified in the [Kotlin documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types).

## Architecture

The project uses TypeScript/Node.js scripts to:
1. Generate type definitions with complete signatures (not comments)
2. Compare definitions to create signature-based mappings
3. Aggregate all mappings into a master YAML file

## Project Structure

```
.
├── src/                           # TypeScript source files
│   ├── java-types-db.ts          # Java type signatures database
│   ├── kotlin-types-db.ts        # Kotlin type signatures database
│   ├── fetch-java-definition.ts  # Generate Java type definitions
│   ├── fetch-kotlin-definition.ts # Generate Kotlin type definitions
│   ├── generate-mapping-details.ts # Compare definitions and create mappings
│   ├── generate-mapped-types-yaml.ts # Aggregate all mappings
│   └── generate-all.ts           # Main orchestrator
├── mappings/                      # Generated mapping directories
│   └── <kotlin_Type>_to_<java_Type>/
│       ├── java-definition.java      # Java type with full signatures
│       ├── kotlin-definition.kt      # Kotlin type with full signatures
│       └── mapping-details.yaml      # Signature-to-signature mappings
├── mapped-types.yaml              # Master mapping file (generated)
└── package.json                   # Node.js project configuration
```

## Generation Scripts

### Install Dependencies

```bash
npm install
```

### Generate All Mappings

```bash
npm run generate
```

This will:
1. Generate Java and Kotlin definition files for all mapped types
2. Create mapping-details.yaml for each pair
3. Aggregate into mapped-types.yaml

### Generate Specific Components

```bash
# Generate mapping details from existing definitions
npm run generate:mapping-details <kotlin-def.kt> <java-def.java> <output.yaml>

# Generate final mapped-types.yaml from all mapping directories
npm run generate:mapped-types
```

## Type Definitions

### Java Definitions

Java definitions include complete method signatures:

```java
package java.lang;

public final class String implements java.io.Serializable, Comparable<String>, CharSequence {
    public char charAt(int index);
    public int compareTo(String anotherString);
    public int length();
    // ... more methods
}
```

### Kotlin Definitions

Kotlin definitions include properties and functions with full signatures:

```kotlin
package kotlin

class String : Comparable<String>, CharSequence {
    val length: Int
    operator fun get(index: Int): Char
    fun compareTo(other: String): Int
    // ... more functions
}
```

## Mapping Details

Mapping details use signature-to-signature comparison (not grouped by property/method):

```yaml
- kotlin: "val length: Int"
  java: public int length()
- kotlin: "operator fun get(index: Int): Char"
  java: public char charAt(int index)
- kotlin: "fun compareTo(other: String): Int"
  java: public int compareTo(String anotherString)
```

## Type Signature Databases

The project maintains authoritative type signature databases in:
- `src/java-types-db.ts` - Java API signatures
- `src/kotlin-types-db.ts` - Kotlin API signatures

These databases are based on official API documentation and can be extended to include all mapped types.

## Mapped Types

The project covers 32 type mappings between Kotlin and Java:

- **Primitives**: Byte, Short, Int, Long, Char, Float, Double, Boolean
- **Common Types**: Any, String, CharSequence, Throwable
- **Interfaces**: Cloneable, Comparable, Enum, Annotation
- **Read-only Collections**: Iterator, Iterable, Collection, Set, List, ListIterator, Map, Map.Entry
- **Mutable Collections**: MutableIterator, MutableIterable, MutableCollection, MutableSet, MutableList, MutableListIterator, MutableMap, MutableMap.MutableEntry

## Development

### Add New Type Signatures

1. Add to `src/java-types-db.ts` with complete method signatures
2. Add to `src/kotlin-types-db.ts` with properties and functions
3. Run `npm run generate` to regenerate all mappings

### Fetching from Authoritative Sources

The current implementation uses curated databases. Future enhancements could:
- Parse `.class` files for Java signatures
- Parse Kotlin `.kt` source or `.api` files
- Scrape from official API documentation websites

## References

- [Kotlin Java Interop Documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types)
- [Kotlin API Documentation](https://kotlinlang.org/api/latest/jvm/stdlib/)
- [Java API Documentation](https://docs.oracle.com/en/java/javase/11/docs/api/)

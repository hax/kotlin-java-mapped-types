# Implementation Details

This document contains additional technical details about the project implementation.

## Generation Statistics

- **Total Mappings**: 32
- **Java Definition Files**: 32 (`.java`)
- **Kotlin Definition Files**: 32 (`.kt`)
- **Detailed Mapping Files**: 32 (`.yaml`)
- **Total Files Generated**: 96 mapping files

## Type Categories

1. **Primitive Types** (8): Byte, Short, Int, Long, Char, Float, Double, Boolean
2. **Common Types** (4): Any, String, CharSequence, Throwable
3. **Interfaces** (4): Cloneable, Comparable, Enum, Annotation
4. **Read-only Collections** (8): Iterator, Iterable, Collection, Set, List, ListIterator, Map, Map.Entry
5. **Mutable Collections** (8): MutableIterator, MutableIterable, MutableCollection, MutableSet, MutableList, MutableListIterator, MutableMap, MutableMap.MutableEntry

## Key Mapping Examples

### Property to Method Mappings

Kotlin properties often map to Java methods:

- `kotlin.String.length` → `java.lang.String.length()`
- `kotlin.collections.List.size` → `java.util.List.size()`
- `kotlin.collections.Map.entries` → `java.util.Map.entrySet()`
- `kotlin.collections.Map.keys` → `java.util.Map.keySet()`
- `kotlin.collections.Map.values` → `java.util.Map.values()`
- `kotlin.Throwable.message` → `java.lang.Throwable.getMessage()`
- `kotlin.Throwable.cause` → `java.lang.Throwable.getCause()`
- `kotlin.Enum.name` → `java.lang.Enum.name()`
- `kotlin.Enum.ordinal` → `java.lang.Enum.ordinal()`

### Special Operator Functions

Some Kotlin operator functions map to different Java method names:

- `kotlin.String.get(index)` → `java.lang.String.charAt(index)`
- `kotlin.CharSequence.get(index)` → `java.lang.CharSequence.charAt(index)`
- `kotlin.collections.MutableList.removeAt(index)` → `java.util.List.remove(int index)`

### Read-only vs Mutable Collections

Kotlin distinguishes between read-only and mutable collections, but both map to the same Java types:

- `kotlin.collections.List` → `java.util.List` (read-only in Kotlin)
- `kotlin.collections.MutableList` → `java.util.List` (mutable in Kotlin)

The Kotlin compiler ensures type safety at compile time, even though the underlying Java type is the same.

#### Important Note

When viewing the mappings, keep in mind how the definitions are presented:

- **Java definitions** show the complete Java interface including all methods (both read and write operations).
- **Kotlin definitions** show only the methods available in the Kotlin type.
- **Read-only Kotlin types** (like `kotlin.collections.List`) list only read operations in their definitions.
- **Mutable Kotlin types** (like `kotlin.collections.MutableList`) list both read and write operations.

This means that even when two Kotlin types share the same underlying Java type, their generated definitions will differ based on which operations the Kotlin type exposes.

## API Documentation Sources

### Java Types

Type information is fetched from [Android Developer Documentation](https://developer.android.com/reference/):

- URL format: `https://developer.android.com/reference/{package}/{class}`
- Example: `https://developer.android.com/reference/java/lang/String`

HTML is parsed to extract:
- Class/interface declaration
- Method signatures with modifiers, return types, names, and parameters
- Inheritance relationships

### Kotlin Types

Type information is fetched from [Kotlin API Reference](https://kotlinlang.org/api/core/kotlin-stdlib/):

- URL format: `https://kotlinlang.org/api/core/kotlin-stdlib/{package}/{-class-name}/`
- Class names are converted to kebab-case with leading dash
- Example: `kotlin.collections.MutableMap` → `https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-mutable-map/`

HTML is parsed to extract:
- Class/interface declaration
- Property signatures (val/var with types)
- Function signatures with modifiers, return types, names, and parameters
- Inheritance relationships

## Mapping Algorithm

The mapping generation follows these steps:

1. **Fetch Definitions**: Retrieve type information from official API documentation
2. **Generate Definition Files**: Create Java and Kotlin files with complete signatures
3. **Parse Definitions**: Extract structured data from the generated definition files
4. **Match Signatures**: Compare Kotlin and Java members to find mappings:
   - Direct name matches (e.g., `compareTo` → `compareTo`)
   - Property to getter method (e.g., `message` → `getMessage`)
   - Special cases (e.g., `get()` → `charAt()`, `removeAt()` → `remove(int)`)
5. **Generate Mapping Details**: Create YAML files with signature-to-signature mappings
6. **Aggregate**: Combine all mapping directories into `mapped-types.yaml`

## Development Notes

### Adding New Type Mappings

To add a new type mapping:

1. Add the mapping to the `MAPPED_TYPES` array in `src/generate-all.ts`
2. Run `npm run generate` to fetch and generate all files
3. The system will automatically:
   - Fetch type information from official docs
   - Generate definition files
   - Create mapping details
   - Update `mapped-types.yaml`

### Error Handling

The system uses a fail-fast approach:
- If official API documentation is unavailable, the process throws an error
- No fallback databases are used
- This ensures all type information comes from authoritative sources

### Future Enhancements

Potential improvements:

1. **Caching**: Cache fetched API documentation to reduce network requests
2. **Incremental Updates**: Only regenerate changed mappings
3. **Validation**: Add tests to verify mapping accuracy
4. **Alternative Sources**: Support multiple API documentation sources

        ├── kotlin-definition.kt      # Kotlin type definition
        └── mapping-details.yaml      # Detailed mappings
```

### Generation Process

The project uses a Python script (`generate_mappings.py`) that:
1. Reads the master list from `mapped-types.yaml`
2. For each mapping pair, creates a directory
3. Generates Java type definitions based on known API signatures
4. Generates Kotlin type definitions based on known API signatures
5. Calculates detailed mappings between properties and methods
6. Outputs all information in a structured format

### Validation

All 32 mappings have been successfully generated with:
- ✅ Complete Java type definitions
- ✅ Complete Kotlin type definitions
- ✅ Detailed property-to-method mappings
- ✅ Detailed method-to-method mappings
- ✅ Proper handling of inheritance relationships
- ✅ Accurate representation of interface vs class types

## Use Cases

This documentation is useful for:
1. Understanding how Kotlin types map to Java types in interop scenarios
2. Learning the differences between Kotlin properties and Java methods
3. Reference when writing mixed Kotlin/Java code
4. Understanding the Kotlin standard library's relationship with Java
5. Educational purposes for developers learning Kotlin
